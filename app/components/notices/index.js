import React from 'react';
import SBHSStore from '../../stores/sbhs';
import SettingsStore from '../../stores/settings';
import SBHSException from '../sbhs-exception';
import Centered from '../centered';
import Loader from '../loader';
import { Expandable } from '../expandable';
import { DAYS } from '../../data/day-constants';
import s from './style.css';
import { THEME_COLORS, ThemeContext, THEMES } from '../themes';

export class Notices extends React.Component {
  static contextType = ThemeContext;

  constructor(props) {
    super(props);

    this.state = {
      notices: null,
      date: null,

      initiallyExpanded: SettingsStore.expandNotices,
      filter: SettingsStore.noticesFilter
    };
  }

  getData = () => {
    if (SBHSStore.notices) {
      this.setState({
        date: SBHSStore.notices.date,
        notices: SBHSStore.notices.notices
      });
    }
  };

  getSettings = () => {
    this.setState({
      initiallyExpanded: SettingsStore.expandNotices,
      filter: SettingsStore.noticesFilter
    });
  };

  componentWillMount() {
    SBHSStore.bind('notices', this.getData);
    this.getData();

    SettingsStore.bind('update', this.getSettings);
  }

  componentWillUnmount() {
    SBHSStore.unbind('notices', this.getData);
    SettingsStore.unbind('update', this.getSettings);
  }

  render() {
    if (!this.state.notices) return <Centered vertical horizontal>
      <SBHSException
        loading={<Loader/>}
        loggedOut={<span><a href='/auth/login'>Login</a> to see the notices!</span>}
        offline='Go online to read the notices!'/>
    </Centered>;

    let notices = this.state.notices;
    if (this.state.filter) notices = notices.filter(notice => notice.targetList.indexOf(this.state.filter) !== -1);

    if (!notices.length) return <Centered vertical horizontal>
      No notices.
    </Centered>;

    const accentColor = (this.context && this.context.details) ? this.context.details.accent : THEME_COLORS[THEMES.LIGHT].accent;

    return <Centered horizontal>
      <div className={s.notices}>
        {notices.map((notice, i) => {
          let meeting;
          if (notice.meeting) {
            let meetingDate = new Date(notice.meeting.date);
            meeting = <span style={{'color': accentColor}}>
              {` on ${DAYS[meetingDate.getDay()]} ${meetingDate.getDate()}` + (notice.meeting.time ? ', ' + notice.meeting.time : '')}
            </span>;
          } else {
            meeting = null;
          }

          return <Expandable
            className={s.notice}
            key={i}
            title={notice.title}
            titleComponent={<div className={s.title}>
              <div className={s.titleInner}><span>{notice.title}</span>{meeting}</div>
              <div className={s.author} style={{color: accentColor}}>{notice.author} | {notice.target}</div>
            </div>}
            content={<div dangerouslySetInnerHTML={{__html: notice.content}}/>}
            initiallyExpanded={this.state.initiallyExpanded}/>
        })}
      </div>
    </Centered>;
  }
}
