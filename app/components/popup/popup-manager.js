import React from 'react';
import { PopupsList } from './popups-list';
import { findByKey } from '../helpers/findByKey';
import { TOAST_ACTION_QUEUE, ToastEvents } from './toast';

const localStorage = window['localStorage'];

export class PopupManager extends React.Component {
  constructor(props) {
    super(props);
    this._allPopups = null;
  }

  onPopupClosed = () => this.storePopups();

  storePopups = () => {
    const popups = this._allPopups;
    if (popups && popups.length) {
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
      const stored = findByKey(storedPopups, 'title', popupsListElement.title);
      if (stored) {
        if (!stored.read) popups.push(stored);
      } else {
        popups.push(popupsListElement);
      }

      this._allPopups.push(stored ? stored : popupsListElement);
    }

    for (const popup of popups) {
      popup.onClose = this.onPopupClosed;
      ToastEvents.trigger(TOAST_ACTION_QUEUE, popup)
    }

    this.storePopups();
  }

  render() {
    return null
  }
}