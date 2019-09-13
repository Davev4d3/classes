import React from 'react';
import PropTypes from 'prop-types';
import s from './Popup.css';

/**
 * A cosmetic wrapper for child elements inside a Popup component
 * @author Dawei Wu
 */
export class PopupInner extends React.PureComponent {

  static propTypes = {
    children: PropTypes.node.isRequired
  }

  render() {
    return (
      <div className={s['popup--inner']}>
        {this.props.children}
      </div>
    );
  }
}