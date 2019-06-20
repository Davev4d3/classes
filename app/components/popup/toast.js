import React from 'react';
import { Popup } from './popup';
import SBHSStore from '../../stores/sbhs';
import { PopupManager } from './popup-manager';
import Emitter from '../../utilities/emitter';

export const TOAST_ACTION_QUEUE = 'QUEUE';

class ToastEmitter extends Emitter {
  constructor() {
    super();
    this._deferred = [];
  }

  bind(event, fn) {
    super.bind(event, fn);
    // Trigger events that were queued before there were any subscribers
    if (this._deferred.length) {
      let i = 0;
      while (i < this._deferred.length) {
        const e = this._deferred[i];
        if (e[0] === event) {
          this._deferred.splice(i, 1);
          this.trigger(e[0], e[1]);
        } else i++;
      }
    }
  }

  trigger(event, payload) {
    this._events = this._events || {};
    console.log(this._events, event, payload);
    if (!(event in this._events)) {
      this._deferred.push([event, payload]);
      return
    }
    this._events[event].forEach(fn => fn(payload));
  }
}

export const ToastEvents = new ToastEmitter();

export class Toast extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      popups: [],
      currentIndex: 0
    };

    this._transitionTimeout = 2500;
  }

  queue = popup => {
    console.log('queueing', popup);
    if (popup.title) {
      this.setState(({popups}) => {
        popups.push(popup);
        return {popups}
      })
    }
  };

  _onClose = (i) => {
    this.setState(({popups, currentIndex}) => {
      popups[i].read = true;
      currentIndex += 1;
      return {popups, currentIndex}
    }, () => {
      const popup = this.state.popups[i];
      if (popup.onClose) popup.onClose()
    })
  };

  componentDidMount() {
    ToastEvents.bind(TOAST_ACTION_QUEUE, this.queue)
  }

  componentWillUnmount() {
    ToastEvents.unbind(TOAST_ACTION_QUEUE, this.queue)
  }

  render() {
    // if (SBHSStore.state !== SBHSStore.LOGGED_IN) return null;
    const {popups, currentIndex} = this.state;
    let popupElements;
    if (popups && popups.length) popupElements = popups.map((v, i) => {
      return <Popup onClose={() => this._onClose(i)}
                    closeTimeout={v.instantClose ? false : undefined}
                    text={v.title}
                    show={i === currentIndex || v.read === true}
                    showDelay={this._transitionTimeout}
                    key={i}
      />;
    });
    else popupElements = null;

    return <>
      {popupElements}
      {this.props.children}
    </>
  }
}
