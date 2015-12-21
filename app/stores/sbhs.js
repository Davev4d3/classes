import Emitter from '../utilities/emitter';
import {get} from '../utilities/request';
import parseTime from '../utilities/parse-time';

import defaultBells from '../data/default-bells';
import {DAYS, WEEKS} from '../data/day-constants';

import Timer from '../utilities/timer';

import TermsStore from './terms';

let localStorage = window['localStorage'];

const MS_TO_WEEKS = 1/(1000 * 60 * 60 * 24 * 7);
const THU2SUN = -1000 * 60 * 60 * 24 * 4;

class SBHSStore extends Emitter {
  constructor() {
    super();

    this.LOADING = 0;
    this.LOGGED_IN = 1;
    this.LOGGED_OUT = 2;

    this.state = this.LOADING;
    this.token = null;
    this.notices = localStorage.notices ? JSON.parse(localStorage.notices) : null;
    this.timetable = localStorage.timetable ? JSON.parse(localStorage.timetable) : null;
    this.today = this._defaultToday();

    this.bind('token', () => {
      this._fetchToday();
      this._fetchNotices();
      this._fetchTimetable();
    });

    this.bind('today', () => {
      Timer(() => {
        this.today = this._defaultToday();
        this.trigger('today');

        this._fetchToday();
        this._fetchNotices();
      }, parseTime(new Date(this.today.date), this.today.bells[this.today.bells.length - 1].time));
    });

    setInterval(() => {
      this._fetchToday();
      this._fetchNotices();
    }, 15 * 60 * 1000); // 15 minutes.

    TermsStore.bind('terms', () => {
      if (this.today && this.today.default) {
        this.today = this._defaultToday();
        this.trigger('today');
      }
    });

    this._fetchToken();
  }

  _defaultDay(date) {
    if (TermsStore.terms) {
      let terms = TermsStore.terms;

      let state = null;
      for (var i = 0; i < terms.length; i++) {
        if (terms[i].start > date) {
          break;
        } else if (terms[i].end >= date) {
          state = WEEKS[(Math.floor(((+date) + THU2SUN) * MS_TO_WEEKS) - Math.floor((terms[i].start + THU2SUN) * MS_TO_WEEKS) + terms[i].offset) % 3];
          break;
        }
      }

      if (state == null)
        return null;

      return `${DAYS[date.getDay()]} ${state}`;
    } else {
      return null;
    }
  }

  clearCache() {
    delete localStorage.token;
    delete localStorage.notices;
    delete localStorage.timetable;
  }

  _defaultToday() {
    let date = new Date();
    date.setUTCHours(0, 0, 0, 0);

    let today = {
      date: date,
      finalized: false,
      default: true
    };

    let bells;
    while (true) {
      bells = defaultBells(today.date);

      if (bells.length > 0)
        if (parseTime(new Date(today.date), bells[bells.length - 1].time) > Date.now())
          break;

      today.date.setTime(today.date.getTime() + (24 * 60 * 60 * 1000));
    }

    let day = this._defaultDay(today.date);
    if (!day && TermsStore.terms) {
      let terms = TermsStore.terms,
        now = Date.now();

      for (var i = 0; i < terms.length; i++) {
        if (terms[i].start >= now) {
          today.date = new Date(terms[i].start);
          day = this._defaultDay(today.date);
          break;
        }
      }
    }

    today.day = day;

    today.bells = bells.map(bell => {
      return {
        title: bell.bell.replace(/^(\d+)$/, 'Period $1'),
        time: bell.time,
        variations: []
      };
    });

    return today;
  }

  _fetchToken() {
    let done = (data) => {
      this.state = this.LOGGED_IN;
      this.token = data['accessToken'];
      Timer(() => this._fetchToken(), data['expires']);
      this.trigger('token');
    };

    if (localStorage.token) {
      let data = JSON.parse(localStorage.token);
      if (data['expires'] > Date.now())
        return done(data);
    }

    get('/auth/token', (err, res) => {
      if (err) {
        this.state = this.LOGGED_OUT;
        this.token = null;
        return this.trigger('token');
      }

      localStorage.token = res;
      done(JSON.parse(res));
    });
  }

  _fetchToday() {
    if (this.token) {
      get(`https://student.sbhs.net.au/api/timetable/daytimetable.json?access_token=${encodeURIComponent(this.token)}`, (err, objectString) => {
        if (err)
          return console.error(`Could not load day timetable. Error: ${err}. Data: ${objectString}`); //TODO: Snackbar.

        let data = JSON.parse(objectString);

        let periods = data['timetable']['timetable']['periods'];

        let bells = [], i = {};
        data['bells'].forEach(bell => {
          let id = bell['bell'];

          i[id] = bells.length;

          let subjectData;
          if (id in periods)
            subjectData = data['timetable']['subjects'][periods[id].year + periods[id].title];

          if (subjectData) {
            bells.push({
              title: subjectData['title'],
              time: bell.time,
              teacher: subjectData['fullTeacher'],
              room: periods[id]['room'],
              variations: []
            });
          } else {
            bells.push({
              title: bell['bellDisplay'],
              time: bell['time']
            });
          }
        });

        for (let key in data['roomVariations']) {
          let variation = data['roomVariations'][key];
          bells[i[variation['period']]].room = variation['roomTo'];
          bells[i[variation['period']]].variations.push('room');
        }
        for (let key in data['classVariations']) {
          let variation = data['classVariations'][key];
          if (variation['type'] !== 'novariation') {
            bells[i[variation['period']]].teacher = (variation['type'] === 'replacement') ? variation['casualSurname'] : null;
            bells[i[variation['period']]].variations.push('teacher');
          }
        }

        let today = {
          date: new Date(data['date']),
          bells: bells,
          day: data['timetable']['timetable']['dayname'],
          finalized: data['shouldDisplayVariations']
        };

        //TODO: Snackbar.
        if (parseTime(new Date(today.date), today.bells[today.bells.length - 1].time) < Date.now())
          return console.error('Dear lord I think we\'ve travelled through time!');

        this.today = today;
        this.trigger('today');
      });
    } else {
      get('https://student.sbhs.net.au/api/timetable/bells.json', (err, objectString) => {
        if (err)
          return console.error(`Could not load bells. Error: ${err}. Data: ${objectString}`); //TODO: Snackbar.

        let data = JSON.parse(objectString);

        let today = {
          date: new Date(data['date']),
          bells: data['bells'].map(bell => {
            return {
              title: bell['bell'].replace(/^(\d+)$/, 'Period $1'),
              time: bell['time'],
              variations: data['bellsAltered'] ? ['time'] : []
            };
          }),
          day: data['day'] + ' ' + data['weekType']
        };

        //TODO: Snackbar.
        if (parseTime(new Date(today.date), today.bells[today.bells.length - 1].time) < Date.now())
          return console.error('Dear lord I think we\'ve travelled through time!');

        this.today = today;
        this.trigger('today');
      });
    }
  }

  _fetchNotices() {
    if (this.token) {
      get(`https://student.sbhs.net.au/api/dailynews/list.json?access_token=${encodeURIComponent(this.token)}`, (err, objectString) => {
        if (err)
          return console.error(`Could not load notices. Error: ${err} Data: ${objectString}.`) //TODO: Snackbar.

        let data = JSON.parse(objectString);

        //TODO: Remove this when they fix the API.
        data['notices'] = data['notices'].map(notice => {
          notice['isMeeting'] = parseInt(notice['isMeeting']);
          notice['relativeWeight'] = parseInt(notice['relativeWeight']);
          return notice;
        });

        this.notices = {
          date: new Date(data['dayInfo']['date']),
          notices: data['notices'].sort((a, b) => (b['relativeWeight'] + b['isMeeting']) - (a['relativeWeight'] + a['isMeeting'])).map(notice => {
            return {
              title: notice['title'],
              content: notice['content'],
              author: notice['authorName'],

              target: notice['displayYears'],
              targetList: notice['years'],

              meeting: notice['isMeeting'] ? {
                date: +(new Date(notice['meetingDate'])),
                time: notice['meetingTime']
              } :null
            };
          })
        };

        localStorage.notices = JSON.stringify(this.notices);
        this.trigger('notices');
      });
    }
  }

  _fetchTimetable() {
    if (this.token) {
      get(`https://student.sbhs.net.au/api/timetable/timetable.json?access_token=${encodeURIComponent(this.token)}`, (err, objectString) => {
        if (err)
          return console.error(`Could not load timetable. Error: ${err}. Data: ${objectString}`); //TODO: Snackbar.

        let data = JSON.parse(objectString);

        let subjectIndex = {};

        let subjects = Object.keys(data['subjects'])
          .map(key => {
            let subject = data['subjects'][key];
            return {
              title: subject['title'],
              abbr: subject['year'] + subject['shortTitle'],
              subject: subject['subject'],
              teacher: subject['fullTeacher']
            };
        });

        let rawStudent = data['student'];
        let rawDays = data['days'];

        this.timetable = {
          student: {
            givenName: rawStudent['givenname'],
            surname: rawStudent['surname'],
            id: rawStudent['studentid'],
            year: rawStudent['year']
          },
          subjects: subjects,
          days: Object.keys(rawDays)
            .map(i => parseInt(i))
            .sort((a, b) => a - b)
            .map(key => {
              let rawDay = rawDays[key],
                periods = [];

              let indices = rawDay['routine'].match(/\d/g),
                rawPeriods = rawDay['periods'];

              for (let ii = 0; ii < indices.length; ii++) {
                let rawPeriod = rawPeriods[indices[ii]];
                if (rawPeriod) {
                  let abbr = rawPeriod['year'] + rawPeriod['title'], j;
                  for (j = subjects.length; j--;)
                    if (abbr === subjects[j].abbr)
                      break;

                  //TODO: Remove this when they fix the API for accelerants.
                  let subject = subjects[j] || {
                      title: abbr,
                      teacher: rawPeriod['teacher']
                    };

                  periods.push({
                    title: subjects[j].title,
                    room: rawPeriod['room'],
                    teacher: subjects[j].teacher
                  });
                } else {
                  periods.push({});
                }
              }

              return {
                periods: periods,
                day: rawDays[key]['dayname']
              };
            })
        };

        localStorage.timetable = JSON.stringify(this.timetable);
        this.trigger('timetable');
      });
    }
  }
}

export default new SBHSStore();