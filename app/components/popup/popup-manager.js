import React from 'react';
import { PopupsList } from './popups-list';
import { findByKey } from '../helpers/findByKey';
import { TOAST_ACTION_QUEUE, ToastEvents } from './toast';
import { get } from '../../utilities/request';

const localStorage = window['localStorage'];
const POPUP_TYPES = {LOCAL: 'popups', REMOTE: 'popovers'};

export class PopupManager extends React.Component {
  constructor(props) {
    super(props);
    this._allPopups = {};
  }

  onPopupClosed = (type) => {
    console.log('closed', type, this._allPopups);
    return this.storePopups(type);
  };

  storePopups = (type) => {
    const popups = this._allPopups[type];
    if (popups && popups.length) {
      try {
        localStorage[type] = JSON.stringify(popups)
      } catch (e) {
        console.warn(e)
      }
    }
  };

  getPopups() {
    get('/api/notice', (err, raw) => {
      if (err) return;
      const data = JSON.parse(raw);
      if (data.data && data.data.length) {
        this.checkPopups(data.data, POPUP_TYPES.REMOTE)
      }
    })
  }

  checkPopups(popupList, type) {
    const storedPopups = localStorage[type] ? JSON.parse(localStorage[type]) : [];
    const popups = [];
    const allPopup = [];
    this._allPopups[type] = allPopup;

    for (const popupsListElement of popupList) {
      const stored = findByKey(storedPopups, 'title', popupsListElement.title);
      if (stored) {
        if (!stored.read) popups.push(stored);
      } else {
        popups.push(popupsListElement);
      }

      allPopup.push(stored ? stored : popupsListElement);
    }

    const onClose = () => this.onPopupClosed(type);
    for (const popup of popups) {
      popup.onClose = onClose;
      ToastEvents.trigger(TOAST_ACTION_QUEUE, popup)
    }

    this.storePopups(type);
  }

  componentDidMount() {
    this.checkPopups(PopupsList, POPUP_TYPES.LOCAL);
    this.getPopups();
  }

  render() {
    return null
  }
}