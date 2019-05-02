import Emitter from '../utilities/emitter';
import {get} from '../utilities/request';
import {WEEKS} from '../data/day-constants';

import NetworkStore from './network';
import { TimerDynamic } from '../utilities/timer';

let localStorage = window['localStorage'];

function getLastDay(terms) {
  let lastDay = new Date(terms[terms.length - 1].end);
  //TODO: Assumption that all days end at 15:15. Move?
  lastDay.setHours(15, 15);
  return lastDay;
}

function processTerms(rawTerms) {
  return Object.keys(rawTerms).map(i => {
    let rawTerm = rawTerms[i];

    return {
      start: +new Date(rawTerm['start']['date']),
      end: +new Date(rawTerm['end']['date']),
      offset: WEEKS.indexOf(rawTerm['start']['weekType'])
    }
  }).sort((a, b) => a.start - b.start);
}

class TermsStore extends Emitter {
  constructor() {
    super();

    this.terms = null;
    if (localStorage['terms']) {
      let terms = JSON.parse(localStorage['terms']);

      if (getLastDay(terms) > Date.now()) {
        this.terms = terms;
        return;
      }
    }

    this.fetch();

    NetworkStore.bind('online', () => {
      if (NetworkStore.online && (!this.terms || getLastDay(this.terms) > Date.now())) {
        this.fetch();
      }
    });
  }

  storeTerms(terms) {
    this.terms = terms;
    localStorage['terms'] = JSON.stringify(terms);

    const lastDay = getLastDay(terms);
    TimerDynamic(this.fetch, lastDay, 15000);

    this.trigger('terms');
  }

  fetch = () => {
    let year = new Date().getFullYear();

    get(`https://student.sbhs.net.au/api/calendar/terms.json?year=${year}`, (err, res) => {
      if (err)
        return console.error(`Could not load terms. Error: ${err}. Data: ${res}`);

      let terms = processTerms(JSON.parse(res)['terms']);

      if (getLastDay(terms) > Date.now()) {
        this.storeTerms(terms);
      } else {
        get(`https://student.sbhs.net.au/api/calendar/terms.json?year=${year + 1}`, (err, res) => {
          if (err)
            return console.error(`Could not load terms. Error: ${err}. Data: ${res}`);

          this.storeTerms(processTerms(JSON.parse(res)['terms']));
        });
      }
    });
  }
}

export default new TermsStore();