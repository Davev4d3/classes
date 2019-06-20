import React from 'react';
import s from './popup.css';

const EXITED_TIMEOUT = 1000;
const TRANSITION_TIMEOUT = 500;

export class Popup extends React.Component {

  static defaultProps = {
    closeTimeout: 2000,
    closeAfter: null,
    destroyOnExit: true,
    show: true
  };

  componentDidUpdate(prevProps) {
    if (this.props.show !== prevProps.show) {
      const state = {
        show: this.props.show,
        easeIn: this.props.show === true
      };

      if (this.props.show === true && this.props.showDelay) {
        state.show = false;
        setTimeout(() => this.delayedShow(true), this.props.showDelay)
      }

      this.setState(state);
    }
  }

  delayedShow = (resetEasing) => {
    if (this.props.show) {
      this.setState({show: true}, resetEasing ? () => {
        setTimeout(this.resetEasing, TRANSITION_TIMEOUT)
      } : undefined)
    }
  };

  resetEasing = () => {
    this.setState(prevState => {
      return {easeIn: this.props.show ? false : prevState.easeIn}
    })
  };

  constructor(props) {
    super(props);

    this.state = {
      exited: false,
      show: props.show,
      easeIn: false,
      closeVisible: !props._closeTimeout || props._closeTimeout === false
    };

    this._closeTimeout = null;
    this._closeAfterTimeout = null;
  }

  exited = () => {
    this.setState({exited: true})
  };

  close = () => {
    if (!this.state.show) return;
    this.setState({show: false});

    if (this.props.onClose && typeof this.props.onClose === 'function') {
      this.props.onClose()
    }

    if (this.props.destroyOnExit) {
      this._destroyTimeout = setTimeout(this.exited, EXITED_TIMEOUT)
    }
  };

  showClose = () => this.setState({closeVisible: true});

  componentDidMount() {
    // Display close button after some time
    if (!this.state.closeVisible) this._closeTimeout = setTimeout(this.showClose, this.props._closeTimeout);
    // Automatically close after some time
    if (this.props.closeAfter) this._closeAfterTimeout = setTimeout(this.close, this.props.closeAfter);
  }

  componentWillUnmount() {
    clearTimeout(this._closeTimeout);
    clearTimeout(this._destroyTimeout);
    clearTimeout(this._closeAfterTimeout)
  }

  render() {
    if (!this.props.text || this.state.exited) return null;

    const style = this.state.show ? {} : {transform: 'translateY(-100%)'};
    if (this.state.easeIn) style.transitionTimingFunction = 'cubic-bezier(0.23, 1, 0.32, 1)';

    return (
      <div className={s.container} style={style}>
        <span className={s.text}>{this.props.text}</span>
        <a className={s.buttonContainer} onClick={this.state.closeVisible ? this.close : null}>
          <div className={s.button}
               style={this.state.closeVisible ? null : {opacity: 0, pointerevents: 'none', cursor: 'normal'}}>x
          </div>
        </a>
      </div>
    )
  }
}