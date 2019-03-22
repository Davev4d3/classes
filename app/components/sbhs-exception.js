import React from 'react';

import SBHSStore from '../stores/sbhs';
import NetworkStore from '../stores/network';

import createReactClass from 'create-react-class';

export default createReactClass({
  getInitialState() {
    return {
      offline: !NetworkStore.online,
      loggedOut: SBHSStore.state == SBHSStore.LOGGED_OUT
    };
  },

  update() {
    this.setState({
      offline: !NetworkStore.online,
      loggedOut: SBHSStore.state == SBHSStore.LOGGED_OUT
    });
  },

  componentWillMount() {
    SBHSStore.bind('token', this.update);
    NetworkStore.bind('online', this.update);
    this.update();
  },

  componentWillUnmount() {
    SBHSStore.unbind('token', this.update);
    NetworkStore.unbind('online', this.update);
  },

  render() {
    let msg = null;

    if (this.state.offline) {
      msg = this.props.offline;
    } else if (this.state.loggedOut) {
      msg = this.props.loggedOut;
    } else {
      msg = this.props.loading;
    }

    return <div>{msg}</div>;
  }
});