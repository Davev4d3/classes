import React from 'react';
import createReactClass from 'create-react-class';
import Centered from '../centered';
import Toggle from '../toggle';
import SettingsStore from '../../stores/settings';
import s from './style.css';

import { THEMES, ThemeToggleExample, useTheme, useThemeSetState } from '../themes';

const DarkThemeToggle = props => {
  const themeState = useTheme();
  const themeSetState = useThemeSetState();

  return (
    <div className={s.row}>
      <div className={s.inner__left}>Dark Theme</div>
      <div className={s.inner__right}>
        <Toggle enabled={themeState.theme === THEMES.DARK}
                onChange={(newState) => themeSetState({theme: newState ? THEMES.DARK : THEMES.LIGHT})}/>
      </div>
    </div>
  )
};

export default createReactClass({
  getInitialState() {
    return {
      expandNotices: SettingsStore.expandNotices,
      showBreaks: SettingsStore.showBreaks,
      showAssessments: SettingsStore.showAssessments,
      noticesFilter: SettingsStore.noticesFilter,
      loadNextDay: SettingsStore.loadNextDay
    };
  },

  update() {
    this.setState({
      expandNotices: SettingsStore.expandNotices,
      showBreaks: SettingsStore.showBreaks,
      showAssessments: SettingsStore.showAssessments,
      noticesFilter: SettingsStore.noticesFilter,
      loadNextDay: SettingsStore.loadNextDay
    });
  },

  clearAllData() {
    window['localStorage']['clear']();
    window['location']['reload']();
  },

  componentDidMount() {
    SettingsStore.bind('update', this.update);
  },

  componentWillUnmount() {
    SettingsStore.unbind('update', this.update);
  },

  render() {
    return <Centered vertical horizontal>
      <div className={s.settings}>
        <div className={s.rowContainer}>
          <div className={s.row}>
            <div className={s.inner__left}>Classes</div>
            <div className={s.inner__right}/>
          </div>

          <DarkThemeToggle/>

          <div className={s.row}>
            <div className={s.inner__left}>Expand Notices</div>
            <div className={s.inner__right}>
              <Toggle enabled={this.state.expandNotices}
                      onChange={(newState) => SettingsStore.update({expandNotices: newState})}/>
            </div>
          </div>

          <div className={s.row}>
            <div className={s.inner__left}>Load Next Day</div>
            <div className={s.inner__right}>
              <Toggle enabled={this.state.loadNextDay}
                      onChange={(newState) => SettingsStore.update({loadNextDay: newState})}/>
            </div>
          </div>

          <div className={s.row}>
            <div className={s.inner__left}>Show Breaks</div>
            <div className={s.inner__right}>
              <Toggle enabled={this.state.showBreaks}
                      onChange={(newState) => SettingsStore.update({showBreaks: newState})}/>
            </div>
          </div>

          <div className={s.row}>
            <div className={s.inner__left}>Show Assessments</div>
            <div className={s.inner__right}>
              <Toggle enabled={this.state.showAssessments}
                      onChange={(newState) => SettingsStore.update({showAssessments: newState})}/>
            </div>
          </div>

          <div className={s.row}>
            <div className={s.inner__left}>Notices Filter</div>
            <div className={s.inner__right}>
              <select
                onChange={e => SettingsStore.update({noticesFilter: e.target.value || null})}
                value={this.state.noticesFilter}
                className={s.select}>
                <option value=''>All Years</option>
                <option value='7'>Year 7</option>
                <option value='8'>Year 8</option>
                <option value='9'>Year 9</option>
                <option value='10'>Year 10</option>
                <option value='11'>Year 11</option>
                <option value='12'>Year 12</option>
                <option value='Staff'>Staff</option>
              </select>
            </div>
          </div>

          <div className={s.row}>
            <div className={s.inner__left}>Content Settings</div>
            <div className={s.inner__right}>
              <button onClick={this.clearAllData}>Clear All Data</button>
            </div>
          </div>
        </div>
      </div>
    </Centered>;
  }
});