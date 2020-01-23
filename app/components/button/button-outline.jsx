import React from 'react';
import PropTypes from 'prop-types';
import s from './button-outline.scss';

const buttonPropTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
  onClick: PropTypes.func,
};

export function ButtonOutline(props) {
  return (
    <button className={props.className ? s.buttonOutline + ' ' + props.className : s.buttonOutline}
            onClick={props.onClick}
    >
      <div className={s.content}>{props.children}</div>
    </button>
  )
}

ButtonOutline.propTypes = buttonPropTypes;
