import React, { useState, useEffect, useContext } from 'react';

export const THEMES = {
  DARK: 'DARK',
  LIGHT: 'LIGHT'
};

export const THEME_COLORS = {
  [THEMES.LIGHT]: {
    primary: '#00bfff',
    accent: '#757575'
  },
  [THEMES.DARK]: {
    background: '#222',
    color: '#fafafa',
    primary: '#00bfff',
    accent: '#bbb',
  },
};

const THEME_STORAGE_FILTER = ['theme'];

export const ThemeContext = React.createContext();
export const ThemeSetContext = React.createContext();

function getPreferredTheme() {

  function getInitialTheme() {
    const d = localStorage.getItem('theme');
    return d ? JSON.parse(d) : {theme: THEMES.LIGHT}
  }

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

export function ThemeToggleExample(props) {
  const themeState = useTheme();
  const setThemeState = useThemeSetState();
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
      })}>toggle
      </button>
    </div>
  )
}

export const useTheme = () => useContext(ThemeContext);
export const useThemeSetState = () => useContext(ThemeSetContext);

export function ThemeGetDetails(themeName) {
  const details = THEME_COLORS[themeName];
  if (details) return details;
}

export function ThemeProvider(props) {
  const {theme, queryEvents} = getPreferredTheme();
  const [initialThemeState, setThemeState] = useState(theme);

  queryEvents.addEventListener(({matches}) => {
    setThemeState(matches ? THEMES.DARK : THEMES.LIGHT)
  });

  useEffect(() => {
    const filtered = Object.keys(initialThemeState)
      .filter(key => THEME_STORAGE_FILTER.includes(key))
      .reduce((obj, key) => {
        obj[key] = initialThemeState[key];
        return obj;
      }, {});
    localStorage.setItem('theme', JSON.stringify(filtered))
  }, [initialThemeState.theme]);

  useEffect(() => {
    const themeDetails = ThemeGetDetails(initialThemeState.theme);
    setThemeState(prevState => ({...prevState, details: themeDetails}));
  }, [initialThemeState.theme]);

  return (
    <ThemeSetContext.Provider value={setThemeState}>
      <ThemeContext.Provider value={initialThemeState}>
        {props.children}
      </ThemeContext.Provider>
    </ThemeSetContext.Provider>
  )
}