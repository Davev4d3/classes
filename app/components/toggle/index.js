import React from 'react';
import s from './style.css';
import { THEMES, useTheme } from '../themes';

export function Toggle(props) {
  const themeState = useTheme();

  return <div
    className={props.checked ? s.enabled : ''}
    style={{width: 36, height: 14, position: 'relative'}}
    onClick={() => props.onChange(!props.checked)}>
    <div className={s.track}/>
    <div className={s.head} style={themeState.theme === THEMES.DARK ? {borderColor: 'transparent'} : null}/>
  </div>;
}
