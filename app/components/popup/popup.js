import React from 'react';
import s from './popup.css';

const EXITED_TIMEOUT = 1000;
const TRANSITION_TIMEOUT = 500;

export class Popup extends React.Component {

  static defaultProps = {
    closeTimeout: 2000,
    closeAfter: null,
    destroyOnExit: true,
    show: true,
    animateOnMount: true
  };

  componentDidUpdate(prevProps) {
    if (this.props.show !== prevProps.show) {
      this.handleShow()
    }
  }

  handleShow() {
    const state = {
      show: this.props.show,
      easeIn: !!this.props.show
    };

    if (this.props.show) {
      if (this.props.showDelay) {
        state.show = false;
        setTimeout(() => {
          this.show(true);
          this.setCloseAfterTimeout();
          if (this.props.setInitialToastDisplayed) this.props.setInitialToastDisplayed();
        }, this.props.showDelay)
      } else {

      }
    }

    this.setState(state);
  }

  show = (resetEasing) => {
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
      show: false,
      easeIn: props.animateOnMount,
      exited: false,
      closeVisible: !props.closeTimeout || props.closeTimeout === false
    };

    this._closeTimeout = null;
    this._closeAfterTimeout = null;
  }

  exited = () => {
    this.setState({exited: true})
  };

  close = () => {
    if (!this.props.show) return;

    clearTimeout(this._closeAfterTimeout);

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
    if (!this.state.closeVisible) {
      this._closeTimeout = setTimeout(this.showClose,
        this.props.showDelay ? this.props.showDelay + this.props.closeTimeout : this.props.closeTimeout);
    }
    // Automatically close after some time
    if (this.props.animateOnMount) this.handleShow();
    else if (this.props.closeAfter) this.setCloseAfterTimeout();
  }

  setCloseAfterTimeout() {
    if (this.props.closeAfter) this._closeAfterTimeout = setTimeout(() => {
      this.close();
      console.log('closing popup')
    }, this.props.closeAfter);
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

    const {linkText, url} = this.props;
    const link = (linkText && url) && (
      <span> <a href={url} target='_blank' className={s.link}>{linkText}</a></span>
    );

    return (
      <div className={s.container} style={style}>
        <span className={s.text}>
          {this.props.text}
          {link}
        </span>
        <a className={s.buttonContainer} onClick={this.state.closeVisible ? this.close : null}>
          <div className={s.button}
               style={this.state.closeVisible ? null : {opacity: 0, pointerevents: 'none', cursor: 'normal'}}>x
          </div>
        </a>
      </div>
    )
  }
}