import React from 'react';
import s from './popup.css';

const EXITED_TIMEOUT = 2000;
const TRANSITION_TIMEOUT = 500;

export class Popup extends React.PureComponent {

  static defaultProps = {
    closeTimeout: 2000,
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
      closeVisible: !props.closeTimeout || props.closeTimeout === false ? true : false
    };

    this.closeTimeout = null;
  }

  exited = () => {
    this.setState({exited: true})
  };

  close = () => {
    this.setState({show: false});

    if (this.props.onClose && typeof this.props.onClose === 'function') {
      this.props.onClose()
    }

    if (this.props.destroyOnExit) {
      this._destroyTimeout = setTimeout(this.exited, EXITED_TIMEOUT)
    }
  };

  showClose = () => {
    this.setState({closeVisible: true})
  };

  componentDidMount() {
    this.closeTimeout = setTimeout(this.showClose, this.props.closeTimeout)
  }

  componentWillUnmount() {
    clearTimeout(this.closeTimeout)
    clearTimeout(this._destroyTimeout)
  }

  render() {
    if (!this.props.text || this.state.exited) return null;

    const style = this.state.show ? {} : {transform: 'translateY(-100%)'};
    if (this.state.easeIn) style.transitionTimingFunction = 'cubic-bezier(0.23, 1, 0.32, 1)';

    return (
      <div className={s.container} style={style}>
        <span className={s.text}>{this.props.text}</span>
        <a>
          <div className={s.button} onClick={this.state.closeVisible ? this.close : null}
               style={this.state.closeVisible ? null : {opacity: 0, pointerevents: 'none', cursor: 'normal'}}>x
          </div>
        </a>
      </div>
    )
  }
}