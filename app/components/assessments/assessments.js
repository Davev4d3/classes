import SBHSStore from '../../stores/sbhs';
import { findByKeyNested, findIndexByKey } from '../helpers/findByKey';
import parseTime from '../../utilities/parse-time';

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

  process(data) {
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
    dayNumber = typeof dayNumber === 'number' ? dayNumber.toString() : dayNumber;
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
        toRaw: timeEnd ? timeEnd : null,
        isPeriod: true,
        isAssessment: true,
        variations
      }
    });
  }

  updateTimetable(periods, dayNumber) {
    if (!dayNumber) return false;
    this.fetchData();

    const today = this.fetchDay(dayNumber);
    if (today && today.items && today.items.length) {
      const formattedItems = this.constructor.normaliseItem(today.items, new Date()).map(x => ({
        ...x,
        // room: x.time
      }));

      periods = formattedItems.concat(periods);
      console.log(formattedItems)
    }

    return periods;
  }

  update(bells, date, dateRaw, periods) {
    if (!dateRaw) return false;
    this.fetchData();

    let changed = false;
    const today = this.fetchDate(dateRaw);
    const hasPeriods = periods && periods.length;

    if (today && today.items && today.items.length) {
      const items = this.constructor.normaliseItem(today.items, date);
      console.log('assessments', items);

      for (let i = 0; i < bells.length; i++) {
        let bell = bells[i];
        parseTime(date, bell.time);

        for (const assess of items) {
          const assessmentInPeriod = Boolean(assess.from <= date && date <= assess.to);

          if (assessmentInPeriod) {
            changed = true;
            const periodIndex = hasPeriods ? findIndexByKey(periods, 'title', bell.title) : null;
            if (periodIndex !== -1) {
              console.log(assessmentInPeriod, bell.title, assess.title, periodIndex);
              const prevPeriod = periods[periodIndex - 1];
              if (prevPeriod && prevPeriod === assess) {
                console.log('removing period ' + (periodIndex) + ' ' + periods[periodIndex].title)
                periods.splice(periodIndex, 1);

              } else {
                periods[periodIndex] = assess;
              }
            }

            if (bells[i - 1] && bells[i - 1] === assess) {
              bells.splice(i, 1);
              i--;
            } else {
              bells[i] = assess;
            }
          }
        }
      }
    }

    return changed;
  }
}

export const Assessments = new AssessmentManager();