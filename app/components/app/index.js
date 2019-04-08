import React from 'react';

import Today from '../today';
import Timetable from '../timetable';
import Notices from '../notices';
import Settings from '../settings';

import Tabs from '../tabs';
import Icon from '../icon';
import Loader from '../loader';

import SBHSStore from '../../stores/sbhs';
import NetworkStore from '../../stores/network';

import STYLE from './style.css';
import createReactClass from 'create-react-class';

function button(icon, tooltip) {
  return <div className={STYLE.item +' '+ STYLE.button} title={tooltip}>
      <Icon icon={icon} />
    </div>;
}

export default createReactClass({
  getData() {
    this.setState({
      online: NetworkStore.online,
      auth: SBHSStore.state
    });
  },

  getInitialState() {
    return {
      online: NetworkStore.online,
      auth: SBHSStore.state
    };
  },

  componentWillMount() {
    SBHSStore.bind('token', this.getData);
    NetworkStore.bind('online', this.getData);
  },

  componentWillUnmount() {
    SBHSStore.unbind('token', this.getData);
    NetworkStore.unbind('online', this.getData);
  },

  render() {
    let tabs = [
      {button: button('timer', 'Today'), content: <Today />},
      {button: button('calendar', 'Timetable'), content: <Timetable />},
      {button: button('news', 'Daily Notices'), content: <Notices />},
      {button: button('settings', 'Settings'), content: <Settings />},
      {}];

    if (!this.state.online) {
      tabs.push({button:
        <div className={STYLE.item} title='Offline'>
          <Icon icon='disconnected' />
        </div>
      });
    } else {
      switch (this.state.auth) {
        case SBHSStore.LOADING:
          tabs.push({button:
            <div className={STYLE.item} title='Loading…'>
              <Loader style={{ width: 30, height: 30 }} />
            </div>
          });
          break;
        case SBHSStore.LOGGED_IN:
          tabs.push({
            button: button('logout', 'Log Out'),
            onClick() {
              SBHSStore.constructor.clearCache();
              window.location.href = '/auth/logout';
            }
          });
          break;
        case SBHSStore.LOGGED_OUT:
          tabs.push({
            button: button('login', 'Log In'),
            onClick() {
              window.location.href = '/auth/login';
            }
          });
          break;
      }
    }

    return <Tabs tabs={tabs} />;
  }
});
