import React from 'react';
import { Popup } from './popup';
import SBHSStore from '../../stores/sbhs';
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
          this.trigger(e[0], e[1], e[2] ? e[2] : undefined);
        } else i++;
      }
    }
  }

  trigger(event, payload, cb) {
    this._events = this._events || {};
    if (!(event in this._events)) {
      this._deferred.push([event, payload, cb]);
      return
    }
    let r;
    for (const handler of this._events[event]) {
      r = handler(payload)
    }
    if (cb) cb(r);
  }
}

export const ToastEvents = new ToastEmitter();

export class Toast extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      popups: [],
      currentIndex: 0,
      initialToastDisplayed: false
    };

    this._transitionTimeout = 1200;
    this._initialShowDelay = 500;
  }

  setInitialToastDisplayed = () => {
    this.setState({initialToastDisplayed: true})
  };

  queue = popup => {
    if (popup.title) {
      const close = () => this._onClose(this.state.popups.indexOf(popup));
      this.setState(({popups}) => {
        popups.push(popup);
        return {popups}
      });
      return close;
    }
  };

  _onClose = (i) => {
    if (this.state.popups[i].read) return;
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
    if (SBHSStore.state !== SBHSStore.LOGGED_IN) return null;
    const {popups, currentIndex, initialToastDisplayed} = this.state;
    let popupElements;
    if (popups && popups.length) popupElements = popups.map((v, i) => {
      return <Popup onClose={() => this._onClose(i)}
                    closeTimeout={v.closeTimeout ? v.closeTimeout : (v.instantClose ? false : undefined)}
                    text={v.title}
                    show={v.read === true ? false : i === currentIndex}
                    showDelay={initialToastDisplayed ? this._transitionTimeout : this._initialShowDelay}
                    key={i}
                    closeAfter={v.closeAfter}
                    setInitialToastDisplayed={this.setInitialToastDisplayed}
      />;
    });
    else popupElements = null;

    return <>
      {popupElements}
      {this.props.children}
    </>
  }
}
