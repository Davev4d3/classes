import React from 'react';
import { PopupsList } from './popups-list';
import { findByKey } from '../helpers/findByKey';
import { Popup } from './popup';

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
    console.log(i);
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
      localStorage.setItem('popups', JSON.stringify(popups))
    }
  };

  componentDidMount() {
    const storedPopups = JSON.parse(localStorage.getItem('popups')) || [];
    const popups = [];

    this._allPopups = [];
    for (const popupsListElement of PopupsList) {
      if (!popupsListElement.title) continue;

      const storedElem = findByKey(storedPopups, 'title', popupsListElement.title);
      console.log(storedElem, storedPopups);

      if (!storedElem || (storedElem && !storedElem.read)) popups.push(popupsListElement);
      this._allPopups.push(storedElem ? storedElem : popupsListElement);
    }

    console.log(popups, this._allPopups);

    this.setState({popups}, this.storePopups)
  }

  render() {
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