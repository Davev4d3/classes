import React from 'react';
import { PopupsList } from './popups-list';
import { findByKey } from '../helpers/findByKey';
import { Popup } from './popup';
import SBHSStore from '../../stores/sbhs';

const localStorage = window['localStorage'];

export class PopupManager extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      popups: null,
      oldPopups: []
    };

    this._allPopups = null;
    this._transitionTimeout = 2500;
  }

  onPopupClosed = (i) => {
    if (i !== undefined) {
      this.setState(prevState => {
        const {popups, oldPopups} = prevState;
        popups[i].read = true;
        oldPopups.push(popups[i]);
        return {popups, oldPopups}
      }, this.storePopups)
    }
  };

  storePopups = () => {
    const popups = this._allPopups;
    if (popups && popups.length) {
      // I literally haven't got a clue why safari private won't let this set, but the others work.
      // Just gonna wrap in a try catch
      try {
        localStorage['popups'] = JSON.stringify(popups)
      } catch (e) {
        console.warn(e)
      }
    }
  };

  componentDidMount() {
    const storedPopups = localStorage['popups'] ? JSON.parse(localStorage['popups']) : [];
    const popups = [];

    this._allPopups = [];
    for (const popupsListElement of PopupsList) {
      if (!popupsListElement.title) continue;

      const storedElem = findByKey(storedPopups, 'title', popupsListElement.title);
      if (!storedElem) {
        popups.push(popupsListElement);
      } else if (storedElem && !storedElem.read) {
        popups.push(storedElem);
      }

      this._allPopups.push(storedElem ? storedElem : popupsListElement);
    }

    // console.log(popups, this._allPopups);

    this.setState({popups}, this.storePopups)
  }

  render() {
    if (SBHSStore.state !== SBHSStore.LOGGED_IN) return null;

    const {popups, oldPopups} = this.state;
    if (!popups || !popups.length) return null;

    let currentPopupIndex = null;
    for (let i = 0; i < popups.length; i++) {
      const popup = popups[i];
      if (!popup.read) {
        if (!currentPopupIndex) currentPopupIndex = i;
        break;
      }
    }

    return (<>
      {popups.map((v, i) => {
        return <Popup onClose={() => this.onPopupClosed(i)}
                      closeTimeout={v.instantClose ? false : undefined}
                      text={v.title}
                      show={i === currentPopupIndex || oldPopups.indexOf(v) !== -1}
                      showDelay={this._transitionTimeout}
        />;
      })}
    </>)
  }
}