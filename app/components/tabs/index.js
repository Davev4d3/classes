import React from 'react';
import createReactClass from 'create-react-class';
import STYLE from './style.css';
import { Toast } from '../popup/toast';
import { PopupManager } from '../popup/popup-manager';

export default createReactClass({
  getInitialState() {
    return {selectedIndex: 0};
  },

  render() {
    let buttons = this.props.tabs.map((tab, i) => {
      if (!this.props.tabs[i].button) return <li key={i} className={STYLE.divider}/>;

      return <li
        key={i}
        className={STYLE.button}
        style={{'color': i === this.state.selectedIndex ? '#00BFFF' : null}}
        onClick={tab.content ? () => this.setState({selectedIndex: i}) : tab.onClick}>
        {tab.button}
      </li>;
    });

    return <div className={STYLE.container}>
      <ul className={STYLE.nav} style={{position: 'fixed'}}>{buttons}</ul>
      <ul className={STYLE.nav}/>

      <div className={STYLE.content}>
        <Toast/>
        <PopupManager/>

        {this.props.tabs[this.state.selectedIndex].content}
      </div>
    </div>;
  }
});
