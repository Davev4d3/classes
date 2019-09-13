import React from 'react';
import s from './Popup.css';
import Ref from '../helpers/ref';

export class Popup extends React.Component {

  static defaultProps = {
    closeOnEsc: true,
    closeOnClickOutside: true,
    openByDefault: false,
    disabled: false
  }

  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.openByDefault
    }
  }

  close = () => {
    const {onClose} = this.props;
    if (!this.state.isOpen) return false;

    if (onClose) onClose();
    this.setState({isOpen: false})
  }

  open = () => {
    const {onOpen, disabled} = this.props;
    if (this.state.isOpen || disabled) return false;

    if (onOpen) onOpen();
    this.setState({isOpen: true})
  }

  onKeyUp = e => {
    if (e.key === 'Escape') this.close()
  }

  componentDidMount() {
    const {closeOnEsc} = this.props;

    if (closeOnEsc) {
      window.addEventListener('keyup', this.onKeyUp);
    }
  }

  togglePopup = () => {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  renderTrigger = () => {
    const triggerProps = {};
    const {trigger} = this.props;
    const {isOpen} = this.state;

    triggerProps.onClick = this.togglePopup;

    if (typeof trigger === 'function') {
      return React.cloneElement(trigger(isOpen), triggerProps);
    } else {
      return React.cloneElement(trigger, triggerProps);
    }
  };

  renderContent() {
    const {children} = this.props;
    const {isOpen} = this.state;
    return (
      <div className={s['popup-wrapper']}>
        {typeof children === 'function'
          ? children(isOpen, this.close)
          : children}
      </div>
    );
  }

  setRefTrigger = (e) => {
    this.triggerRef = e;
  }

  render() {
    const {closeOnClickOutside, trigger} = this.props;
    const {isOpen} = this.state;
    const displayOverlay = isOpen;

    return (
      <React.Fragment>
        {!!trigger && (
          <Ref innerRef={this.setRefTrigger}>
            {this.renderTrigger()}
          </Ref>
        )}

        {displayOverlay && (
          <div
            className={s['popup-overlay']}
            onClick={closeOnClickOutside ? this.close : undefined}/>
        )}

        {
          isOpen && this.renderContent()
        }
      </React.Fragment>
    );
  }
}