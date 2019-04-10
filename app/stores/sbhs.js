import Emitter from '../utilities/emitter';
import { get } from '../utilities/request';
import parseTime from '../utilities/parse-time';

import defaultBells from '../data/default-bells';
import { DAYS, WEEKS } from '../data/day-constants';

import Timer from '../utilities/timer';

import TermsStore from './terms';
import NetworkStore from './network';

let localStorage = window['localStorage'];

const MS_TO_WEEKS = 1/(1000 * 60 * 60 * 24 * 7);
const THU2SUN = -1000 * 60 * 60 * 24 * 4;

const REFRESH_MIN = 15 * 1000;
const REFRESH_MAX_TIMEOUT = 4 * 24 * 3600000;

class SBHSStore extends Emitter {
  constructor() {
    super();

    console.log('init data store');

    this.LOADING = 0;
    this.LOGGED_IN = 1;
    this.LOGGED_OUT = 2;

    this.state = this.LOADING;
    this.token = null;
    this.notices = localStorage['notices'] ? JSON.parse(localStorage['notices']) : null;
    this.timetable = localStorage['timetable'] ? JSON.parse(localStorage['timetable']) : null;
    this._defaultToday();

    this.calendar = undefined;

    this.bind('token', () => {
      this._fetchToday();
      this._fetchNotices();
      this._fetchTimetable();
    });

    this.bind('today', () => {
      // timer fires too close together at 3:15. space apart using minimum interval.
      const date = new Date(parseTime(new Date(this.today.date), this.today.bells[this.today.bells.length - 1].time).getTime());
      const timeDiff = date - Date.now();
      let interval;

      const func = () => {
        this._defaultToday();
        this._fetchToday();
        this._fetchNotices();
      };

      if (timeDiff > 0) {
        if (timeDiff > REFRESH_MAX_TIMEOUT) return Timer(func, date);
        interval = timeDiff > REFRESH_MIN ? timeDiff : REFRESH_MIN;
      } else if (timeDiff === 0) {
        return func()
      } else {
        interval = REFRESH_MIN;
      }

      console.log('timer', interval);
      setTimeout(func, interval);
    });

    setInterval(() => {
      this._fetchToday();
      this._fetchNotices();
    }, 15 * 60 * 1000); // 15 minutes.

    NetworkStore.bind('online', () => {
      if (NetworkStore.online) {
        this._fetchToken();
      }
    });

    TermsStore.bind('terms', () => {
      if (this.today && this.today.default) {
        this._defaultToday();
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

  static clearCache() {
    delete localStorage['token'];
    delete localStorage['notices'];
    delete localStorage['timetable'];
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
      let res = {
        title: bell.bell,
        time: bell.time,
        isPeriod: false,
        variations: []
      }

      if (/^\d+$/.test(res.title)) {
        res.isPeriod = true;
        res.title = 'Period ' + res.title;
      }

      return res;
    });

    this.today = today;
    this.trigger('today');
  }

  _fetchToken() {
    let done = (data) => {
      this.state = this.LOGGED_IN;
      this.token = data['accessToken'];
      Timer(() => this._fetchToken(), data['expires']);
      this.trigger('token');
    };

    if (localStorage['token']) {
      let data = JSON.parse(localStorage['token']);
      if (data['expires'] > Date.now()) {
        done(data);
        return;
      }
    }

    get('/auth/token', (err, res) => {
      if (err) {
        this.state = this.LOGGED_OUT;
        this.token = null;
        return this.trigger('token');
      }

      localStorage['token'] = res;
      done(JSON.parse(res));
    });
  }

  _fetchCalendar() {
    if (this.token && this.calendar === undefined) {
      this.calendar = null;

      get(`https://student.sbhs.net.au/api/diarycalendar/events.json?access_token=${encodeURIComponent(this.token)}`, (err, objectString) => {
        if (err) return;

        const data = JSON.parse(objectString);
        this.calendar = data;

        this.trigger('calendar');
      });
    }
  }

  _fetchToday() {
    if (this.token) {
      get(`https://student.sbhs.net.au/api/timetable/daytimetable.json?access_token=${encodeURIComponent(this.token)}`, (err, objectString) => {
        if (err) return console.error(`Could not load day timetable. Error: ${err}. Data: ${objectString}`);

        let data = JSON.parse(objectString);

        let periods = data['timetable']['timetable']['periods'];

        let bells = [], i = {};
        data['bells'].forEach(bell => {
          let id = bell['bell'];
          i[id] = bells.length;

          let subjectData = null;
          if (periods.hasOwnProperty(id)) {
            subjectData = data['timetable']['subjects'][periods[id]['year'] + periods[id]['title']];

            if (periods[id].fullTeacher) {
              subjectData.fullTeacher = periods[id].fullTeacher
            }
          }

          if (subjectData) {
            bells.push({
              title: subjectData['title'],
              time: bell.time,
              teacher: subjectData['fullTeacher'],
              room: periods[id]['room'],
              isPeriod: true,
              variations: []
            });
          } else {
            bells.push({
              title: bell['bellDisplay'],
              time: bell['time'],
              isPeriod: /^\d+$/.test(bell['bell']),
              variations: []
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

        const today = {
          date: new Date(data['date']),
          dateRaw: data['date'],
          bells: bells,
          day: data['timetable']['timetable']['dayname'],
          finalized: data['shouldDisplayVariations']
        };

        //TODO: Snackbar.
        // if (parseTime(new Date(today.date), today.bells[today.bells.length - 1].time) < Date.now())
        //   return console.error('Dear lord I think we\'ve travelled through time!');

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
              isPeriod: /^\d+$/.test(bell['bell']),
              variations: data['bellsAltered'] ? ['time'] : []
            };
          }),
          day: data['day'] + ' ' + data['weekType']
        };

        //TODO: Snackbar.
        // if (parseTime(new Date(today.date), today.bells[today.bells.length - 1].time) < Date.now())
        //   return console.error('Dear lord I think we\'ve travelled through time!');

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

        localStorage['notices'] = JSON.stringify(this.notices);
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
                    title: subject.title,
                    room: rawPeriod['room'],
                    teacher: subject.teacher
                  });
                } else {
                  periods.push({});
                }
              }

              return {
                periods: periods,
                day: rawDays[key]['dayname'],
                dayNumber: key
              };
            })
        };

        localStorage['timetable'] = JSON.stringify(this.timetable);
        this.trigger('timetable');
      });
    }
  }
}

export default new SBHSStore();
