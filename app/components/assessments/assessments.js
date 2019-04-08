import SBHSStore from '../../stores/sbhs';
import { findByKeyNested, findIndexByKey } from '../helpers/findByKey';
import parseTime from '../../utilities/parse-time';

localStorage.token = '{"accessToken":"4aece015b0722876e2903c739d715141672203f4","expires":1554716831829}';

function normaliseTime(s) {
  if (s) {
    const nColons = s.split(':').length - 1;
    if (nColons === 2) {
      return s.substr(0, 5)
    } else if (nColons === 1) {
      return s
    }
  }

  return null
}

class AssessmentManager {
  constructor() {
    this.data = null;
    this.dataBells = {};
    this.eventTypes = ['assessment'];
  }

  fetchData() {
    if (SBHSStore.calendar) {
      if (this.data !== SBHSStore.calendar) this.data = this.process(SBHSStore.calendar);
    } else {
      SBHSStore._fetchCalendar()
    }
  }

  fetchBells() {

  }

  process(data) {
    console.log('filtering assessments');
    if (data && data.length) {
      for (let day of data) {
        let items = day.items;
        if (items && items.length) {
          day.items = items.filter(x => this.eventTypes.indexOf(x.type) !== -1);
        }
      }
    }

    return data
  }

  fetchDate(date) {
    const data = this.data;
    if (data) return findByKeyNested(data, 'info', 'date', date);
  }

  fetchDay(dayNumber) {
    const data = this.data;
    if (data) return findByKeyNested(data, 'info', 'dayNumber', dayNumber);
  }

  static normaliseItem(items, date) {
    const variations = [];

    return items.map((v, i) => {
      let timeStart = v.time;
      let timeEnd = null;

      if (v.data) {
        if (v.data.timeFrom) {
          timeStart = normaliseTime(v.data.timeFrom)
        }

        if (v.data.timeTo) {
          timeEnd = normaliseTime(v.data.timeTo)
        }
      }

      return {
        title: v.title,
        time: timeStart ? timeStart : null,
        from: timeStart ? parseTime(new Date(date.getTime()), timeStart) : null,
        to: timeEnd ? parseTime(new Date(date.getTime()), timeEnd) : null,
        isPeriod: true,
        variations
      }
    });
  }

  updateTimetable(periods, dayNumber, week, day){
    if (!dayNumber) return false;
    this.fetchData();

    let changed = false;
    const today = this.fetchDay(dayNumber);
    if (today && today.items && today.items.length) {
      console.log(today.items)
    }
  }

  update(bells, date, dateRaw, periods) {
    if (!dateRaw) return false;
    this.fetchData();

    let changed = false;
    const today = this.fetchDate(dateRaw);
    const hasPeriods = periods && periods.length;

    console.log(bells, periods, date, dateRaw);

    if (today && today.items && today.items.length) {
      const items = this.constructor.normaliseItem(today.items, date);
      // console.log('today', items);

      // for (let i = bells.length - 1; i >= 0; i--) {
      for (let i = 0; i < bells.length; i++) {
        let bell = bells[i];
        parseTime(date, bell.time);

        for (const assess of items) {
          const assessmentInPeriod = assess.from < date && date < assess.to;
          // console.log(assessmentInPeriod, assess.from, date);

          if (assessmentInPeriod) {
            changed = true;
            const modifyPeriod = bell.isPeriod && hasPeriods;

            if (bells[i - 1] !== assess) {
              bells[i] = assess;

              if (modifyPeriod) {
                const periodIndex = findIndexByKey(periods, 'title', bell.title);
                periods[periodIndex] = assess;
              }
            } else {
              bells.splice(i, 1);
              i--;

              if (modifyPeriod) {
                const periodIndex = findIndexByKey(periods, 'title', bell.title);
                periods.splice(periodIndex, 1);
                console.log('removing period ' + (periodIndex))
              }
            }
          }
        }
      }
    }

    console.log(bells)

    return changed;
  }
}

export const Assessments = new AssessmentManager();