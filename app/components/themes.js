import React, { useState, useEffect } from 'react';

const THEMES = {
  DARK: 'DARK',
  LIGHT: 'LIGHT'
};

function getInitialTheme() {
  const d = localStorage.getItem('theme');
  return d ? JSON.parse(d) : {theme: THEMES.LIGHT}
}

function getPreferredTheme() {
  if (!window.matchMedia) return;

  const preferDarkQuery = '(prefers-color-scheme: dark)';
  const mql = window.matchMedia(preferDarkQuery);

  const queryEvents = {
    addEventListener: (handler) => mql.addEventListener('change', handler),
    removeEventListener: (handler) => mql.removeEventListener('change', handler),
  };

  const isColorSchemeQuerySupported = mql.media === preferDarkQuery;
  const userTheme = getInitialTheme();
  if (isColorSchemeQuerySupported && mql.matches) userTheme.theme = THEMES.DARK;

  return {
    theme: userTheme,
    queryEvents
  }
}

function initialise() {


}

export function ThemeStatus(props) {
  const {theme, queryEvents} = getPreferredTheme();
  const [themeState, setThemeState] = useState(theme);

  queryEvents.addEventListener(({matches}) => {
    setThemeState(matches ? THEMES.DARK : THEMES.LIGHT)
  });

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(themeState))
  }, [themeState]);

  return (
    <div style={themeState.theme === THEMES.DARK ? {
      background: '#222',
      color: '#fafafa'
    } : {}}>
      {themeState.theme === THEMES.DARK ? 'Dark' : 'Light'}

      <button onClick={() => setThemeState(({theme}) => {
        if (theme === THEMES.DARK) theme = THEMES.LIGHT;
        else theme = THEMES.DARK;
        return {theme}
      })}>toggle</button>
    </div>
  )
}

const toggleTheme = () => {
  const mode = themeState.theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
  setThemeState({theme: mode});
};

export function ThemeProvider(props) {
  return (
    <ThemeContext.Provider value={themeState}>
      {themeState.theme}
      <button onClick={toggleTheme}/>
    </ThemeContext.Provider>
  )
}