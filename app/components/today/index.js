import React from 'react';
import SBHSStore from '../../stores/sbhs';
import Centered from '../centered';
import { Countdown } from '../countdown';
import Loader from '../loader';
import parseTime from '../../utilities/parse-time';
import STYLE from './style.css';
import SettingsStore from '../../stores/settings';
import { Assessments } from '../assessments/assessments';
import { TimerDynamic } from '../../utilities/timer';
import { THEME_COLORS, ThemeContext, THEMES } from '../themes';

const VARIATION_COLOR = '#00BFFF';

const BREAKS = {
  'Lunch 1': 'Lunch',
  'Lunch': null,
  'Recess': null
};

function filterClasses(bells) {
  const b = Object.keys(BREAKS);
  if (SettingsStore.showBreaks) {
    return bells.filter(bell => {
      if (bell.isPeriod) return true;
      if (b.includes(bell.title)) {
        const newTitle = BREAKS[bell.title];
        if (newTitle) bell.title = newTitle;
        return true;
      }
    })
  } else {
    return bells.filter(bell => bell.isPeriod)
  }
}

export class Today extends React.Component {
  static contextType = ThemeContext;

  constructor(props) {
    super(props);

    this.state = {
      bells: null,
      periods: null,
      date: null,
      dateRaw: null,

      nextTime: null,
      nextBell: null,

      hasClasses: false,
      lastClassBell: null
    };

    this._nextDayTimeout = null;
  }

  getData = () => {
    if (SBHSStore.today) {
      this.setState({
        bells: SBHSStore.today.bells,
        periods: filterClasses(SBHSStore.today.bells),
        date: SBHSStore.today.date,
        dateRaw: SBHSStore.today.dateRaw,
        hasClasses: SBHSStore.today.hasClasses,
        lastClassBell: SBHSStore.today.lastClassBell
      }, this.getNext);
    }
  };

  getNext = () => {
    let bells = this.state.bells;

    if (bells) {
      const date = new Date(this.state.date);
      const now = Date.now();

      this.getAssessments();

      for (let i = 0; i < bells.length; i++) {
        let bell = bells[i];
        parseTime(date, bell.time);

        if (date > now) {
          this.setState({
            nextBell: bell,
            nextTime: date
          });

          break;
        }
      }
    } else {
      this.setState({
        nextBell: null,
        nextTime: null
      })
    }

    if (SettingsStore.loadNextDay) {
      this.setLastPeriodTimeout()
    }
  };

  setLastPeriodTimeout() {
    if (!this.state.hasClasses || !this.state.lastClassBell) return;
    if (this._nextDayTimeout) clearTimeout(this._nextDayTimeout);

    this._nextDayTimeout = TimerDynamic(this.setNextDay, this.state.lastClassBell, 1000, false);
  }

  setNextDay = () => {
    this.setState({lastClassBell: null});
    console.log('next day');
    SBHSStore.trigger('next_day');
  };

  getAssessments(cb) {
    const bells = this.state.bells;
    if (SettingsStore.showAssessments && bells) {
      const periods = this.state.periods;

      if (Assessments.update(bells, this.state.date, this.state.dateRaw, periods)) {
        this.setState({bells, periods}, cb ? cb : undefined);
      }
    }
  }

  onCalendarFetch = () => {
    this.getNext();
  };

  componentWillMount() {
    SBHSStore.bind('today', this.getData);
    SBHSStore.bind('calendar', this.onCalendarFetch);
    this.getData();
  }

  componentWillUnmount() {
    SBHSStore.unbind('today', this.getData);
    SBHSStore.unbind('calendar', this.onCalendarFetch);
    if (this._nextDayTimeout) clearTimeout(this._nextDayTimeout);
  }

  render() {
    let {periods, nextBell, nextTime} = this.state,
      simple = !periods.some(e => e.room || e.isAssessment);

    const accentColor = (this.context && this.context.details) ? this.context.details.accent : THEME_COLORS[THEMES.LIGHT].accent;

    return <Centered vertical horizontal>
      {nextBell ? <div className={STYLE.next}>
        <span style={{'fontSize': '1.5em'}}>{nextBell.title}</span> in
        <Countdown
          to={nextTime}
          className={STYLE.countdown}
          onComplete={this.getNext}/>
      </div> : <Loader/>}

      {periods.length ? <div className={STYLE.today}>
        {periods.map((bell, i) => {
          if (simple) {
            return <div key={i} className={STYLE.period}>
              <div style={{
                'flexGrow': '1',
                'fontSize': '1.5em',
                'color': bell.variations.indexOf('title') < 0 ? accentColor : VARIATION_COLOR
              }}>
                {bell.title}
              </div>
              <div style={{
                'fontSize': '1.5em',
                'color': bell.variations.indexOf('time') < 0 ? null : VARIATION_COLOR
              }}>
                {bell.time}
              </div>
            </div>;
          }

          if (!bell.room) {
            return <div
              key={i}
              className={STYLE.period}
              style={bell.isAssessment ? null : {'color': accentColor}}>
              <div style={{
                'flexGrow': '1',
                'fontSize': '1.2em',
                'marginBottom': '0.3em',
                'color': bell.variations.indexOf('title') < 0 ? null : VARIATION_COLOR
              }}>
                {bell.title}
              </div>
              <div style={{
                'fontSize': '1.2em',
                'color': bell.variations.indexOf('time') < 0 ? null : VARIATION_COLOR
              }}>
                {bell.time}
              </div>
            </div>;
          }

          return <div key={i} className={STYLE.period}>
            <div style={{'flexGrow': '1'}}>
              <div style={{
                'fontSize': '1.2em',
                'marginBottom': '0.3em',
                'color': bell.variations.indexOf('title') < 0 ? null : VARIATION_COLOR
              }}>{bell.title}</div>
              <div style={{'fontSize': '0.9em'}}>
                <span>
                  {'at '}
                  <span style={{'color': bell.variations.indexOf('time') < 0 ? null : VARIATION_COLOR}}>
                    {bell.time || 'the time of reckoning'}
                  </span>
                </span>
                {' '}
                <span style={{'color': accentColor}}>
                  {'with '}
                  <span style={{'color': bell.variations.indexOf('teacher') < 0 ? null : VARIATION_COLOR}}>
                    {bell.teacher || 'no one'}
                  </span>
                </span>
              </div>
            </div>
            <div style={{
              'fontSize': '1.5em',
              'color': bell.variations.indexOf('room') < 0 ? null : VARIATION_COLOR
            }}>{bell.room}
            </div>
          </div>;
        })}
      </div> : null}
    </Centered>;
  }
}
