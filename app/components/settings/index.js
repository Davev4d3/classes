import React from 'react';
import createReactClass from 'create-react-class';

import Centered from '../centered';
import Toggle from '../toggle';

import SettingsStore from '../../stores/settings';

import STYLE from './style.css';

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
      <div className={STYLE.settings}>
        <div className={STYLE.labels}>
          <div>Classes</div>
          <div>Expand Notices</div>
          <div title={'If you have a free period, this will load tomorrow\'s timetable'}>Load Next Day</div>
          <div>Show Breaks</div>
          <div>Show Assessments</div>
          <div>Notices Filter</div>
          <div>Content Settings</div>
        </div>

        <div className={STYLE.controls}>
          <div style={{'border': 'none', 'width': '90px', 'height': '20px'}}>
          </div>

          <div>
            <Toggle enabled={this.state.expandNotices} onChange={(newState) => SettingsStore.update({ expandNotices: newState })} />
          </div>

          <div>
            <Toggle enabled={this.state.loadNextDay} onChange={(newState) => SettingsStore.update({ loadNextDay: newState })} />
          </div>

          <div>
            <Toggle enabled={this.state.showBreaks} onChange={(newState) => SettingsStore.update({ showBreaks: newState })} />
          </div>

          <div>
            <Toggle enabled={this.state.showAssessments} onChange={(newState) => SettingsStore.update({ showAssessments: newState })} />
          </div>

          <div>
            <select
              onChange={e => SettingsStore.update({ noticesFilter: e.target.value || null })}
              value={this.state.noticesFilter}
              className={STYLE.select}>
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

          <div>
            <button className={STYLE.dangerButton} onClick={this.clearAllData}>Clear All Data</button>
          </div>
        </div>
      </div>
    </Centered>;
  }
});