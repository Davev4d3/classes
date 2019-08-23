import React from 'react';

import { Today } from '../today';
import Timetable from '../timetable';
import { Notices } from '../notices';
import { Settings } from '../settings';
import { Tabs } from '../tabs';
import Icon from '../icon';
import Loader from '../loader';

import SBHSStore from '../../stores/sbhs';
import NetworkStore from '../../stores/network';

import STYLE from './style.css';
import createReactClass from 'create-react-class';
import { ThemeProvider } from '../themes';
import { MediaQuery } from '../media-query';

const collapseMediaQuery = new MediaQuery('min-width: 768px');

function Button(props) {
  const [collapseState, setCollapseState] = React.useState(false);
  const {tooltip, icon, buttonStyle} = props;

  React.useEffect(() => {
    const onChange = ({matches}) => setCollapseState(matches);
    collapseMediaQuery.addEventListener(onChange);
    return () => collapseMediaQuery.removeEventListener(onChange);
  }, [collapseState]);

  return (
    <div
      className={buttonStyle ? STYLE.item + ' ' + STYLE.button : STYLE.item}
      title={tooltip ? (collapseState ? null : tooltip) : null}
      itemname={tooltip}
    >
      {icon && <Icon icon={icon}/>}
    </div>
  );
}

Button.defaultProps = {
  buttonStyle: true
};

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
      {button: <Button icon={'timer'} tooltip={'Today'}/>, content: <Today/>},
      {button: <Button icon={'calendar'} tooltip={'Timetable'}/>, content: <Timetable/>},
      {button: <Button icon={'news'} tooltip={'Daily Notices'}/>, content: <Notices/>},
      {button: <Button icon={'settings'} tooltip={'Settings'}/>, content: <Settings/>},
      {}
    ];

    if (!this.state.online) {
      tabs.push({
        button:
          <div className={STYLE.item} title='Offline'>
            <Icon icon='disconnected'/>
          </div>
      });
    } else {
      switch (this.state.auth) {
        case SBHSStore.LOADING:
          tabs.push({
            button:
              <div className={STYLE.item} title='Loading…'>
                <Loader style={{width: 30, height: 30}}/>
              </div>
          });
          break;
        case SBHSStore.LOGGED_IN:
          tabs.push({
            button: <Button icon={'logout'} tooltip={'Log Out'}/>,
            onClick() {
              SBHSStore.constructor.clearCache();
              window.location.href = '/auth/logout';
            }
          });
          break;
        case SBHSStore.LOGGED_OUT:
          tabs.push({
            button: <Button icon={'login'} tooltip={'Log In'}/>,
            onClick() {
              window.location.href = '/auth/login';
            }
          });
          break;
      }
    }

    return (
      <ThemeProvider>
        <Tabs tabs={tabs}/>
      </ThemeProvider>
    )
  }
});
