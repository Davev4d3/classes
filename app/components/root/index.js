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
import { ThemeProvider } from '../themes';
import { MediaQuery } from '../media-query';
import { initialiseAnalytics } from '../analytics';

const collapseMediaQuery = new MediaQuery('min-width: 768px');

function Button(props) {
  const [collapseState, setCollapseState] = React.useState(collapseMediaQuery.matches || false);
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

const tabs = [
  {
    button: <Button icon={'timer'} tooltip={'Today'}/>,
    content: <Today/>,
    pathname: 'today'
  },
  {
    button: <Button icon={'calendar'} tooltip={'Timetable'}/>,
    content: <Timetable/>,
    pathname: 'timetable'
  },
  {
    button: <Button icon={'news'} tooltip={'Daily Notices'}/>,
    content: <Notices/>,
    pathname: 'notices'
  },
  {
    button: <Button icon={'settings'} tooltip={'Settings'}/>,
    content: <Settings/>,
    pathname: 'settings'
  },
  {}
];

export default class Root extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      online: NetworkStore.online,
      auth: SBHSStore.state
    };
  }

  getData = () => {
    this.setState({
      online: NetworkStore.online,
      auth: SBHSStore.state
    });
  };

  componentWillMount() {
    SBHSStore.bind('token', this.getData);
    NetworkStore.bind('online', this.getData);
    initialiseAnalytics();
  }

  componentWillUnmount() {
    SBHSStore.unbind('token', this.getData);
    NetworkStore.unbind('online', this.getData);
  }

  render() {
    let lastTab;
    if (this.state.online) {
      if (this.state.auth === SBHSStore.LOADING) {
        lastTab = {
          button: <div className={STYLE.item} title='Loading…'><Loader style={{width: 30, height: 30}}/></div>
        }
      } else if (this.state.auth === SBHSStore.LOGGED_IN) {
        lastTab = {
          button: <Button icon={'logout'} tooltip={'Log Out'}/>,
          onClick() {
            SBHSStore.constructor.clearCache();
            window.location.href = '/auth/logout';
          }
        }
      } else if (this.state.auth === SBHSStore.LOGGED_OUT) {
        lastTab = {
          button: <Button icon={'login'} tooltip={'Log In'}/>,
          onClick() {
            window.location.href = '/auth/login';
          }
        }
      }
    } else {
      lastTab = {
        button: <div className={STYLE.item} title='Offline'><Icon icon='disconnected'/></div>
      }
    }

    return (
      <ThemeProvider>
        <Tabs tabs={lastTab ? [...tabs, lastTab] : tabs}/>
      </ThemeProvider>
    )
  }
}
