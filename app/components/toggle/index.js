import React from 'react';

import STYLE from './style.css';
import { THEMES, useTheme } from '../themes';

export default function (props) {
  const themeState = useTheme();
  return <div
    className={props.enabled ? STYLE.enabled : ''}
    style={{ 'width': 36, 'height': 14, 'position': 'relative' }}
    onClick={() => props.onChange(!props.enabled)}>
      <div className={STYLE.track} />
      <div className={STYLE.head} style={themeState.theme === THEMES.DARK ? {borderColor: 'transparent'} : null}/>
    </div>;
}