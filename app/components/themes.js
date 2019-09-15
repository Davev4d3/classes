import React, { useContext, useEffect, useState } from 'react';

export const THEMES = {
  DARK: 'DARK',
  LIGHT: 'LIGHT'
};

export const THEME_COLORS = {
  [THEMES.LIGHT]: {
    accent: '#757575'
  },
  [THEMES.DARK]: {
    background: '#222',
    color: '#fafafa',
    accent: '#bbb',
  },
};

export const PRIMARY_COLOR_NAMES = {
  BLUE: 'CLASSIC_BLUE',
  PURPLE: 'PURPLE',
  MAGENTA: 'MAGENTA',
  DEEPBLUE: 'DEEPBLUE',
  AQUA: 'AQUA',
  GREEN: 'GREEN',
  GREENDARK: 'GREENDARK',
  ORANGE: 'ORANGE',
  RED: 'RED',
};

export const PRIMARY_COLORS = {
  [PRIMARY_COLOR_NAMES.BLUE]: '#00bfff',
  [PRIMARY_COLOR_NAMES.PURPLE]: '#d885ff',
  [PRIMARY_COLOR_NAMES.MAGENTA]: '#ff59e0',
  [PRIMARY_COLOR_NAMES.DEEPBLUE]: '#4877ff',
  [PRIMARY_COLOR_NAMES.AQUA]: '#20fdd9',
  [PRIMARY_COLOR_NAMES.GREEN]: '#37f588',
  [PRIMARY_COLOR_NAMES.GREENDARK]: '#2ecc71',
  [PRIMARY_COLOR_NAMES.ORANGE]: '#ffa412',
  [PRIMARY_COLOR_NAMES.RED]: '#ff5543',
};

export const PRIMARY_COLOR_CSS = 'var(--primary-color)';

const THEME_STORAGE_FILTER = ['theme', 'primaryColor'];

export const ThemeContext = React.createContext();
export const ThemeSetContext = React.createContext();

function getPreferredTheme() {

  function getInitialTheme() {
    const d = localStorage.getItem('theme');
    const initialState = d ? JSON.parse(d) : {theme: THEMES.LIGHT};
    if (!initialState.primaryColor) initialState.primaryColor = PRIMARY_COLOR_NAMES.BLUE;
    return initialState
  }

  if (!window.matchMedia) return;

  const preferDarkQuery = '(prefers-color-scheme: dark)';
  const mql = window.matchMedia(preferDarkQuery);

  const queryEvents = {
    addEventListener: (handler) => {
      if (mql.addEventListener) mql.addEventListener('change', handler);
      else if (mql.addListener) mql.addListener(handler);
    },
    removeEventListener: (handler) => {
      if (mql.removeEventListener) mql.removeEventListener('change', handler);
      else if (mql.removeListener) mql.removeListener(handler);
    },
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

function ThemeGetDetails(themeName, primaryColorName) {
  let details = {};

  const themeColors = THEME_COLORS[themeName];
  if (themeColors) details = {...details, ...themeColors};

  const primaryColor = PRIMARY_COLORS[primaryColorName];
  if (primaryColor) details = {...details, primaryColor};

  return details;
}

export class ThemeProvider extends React.Component {
  constructor(props) {
    super(props);

    const {theme, queryEvents} = getPreferredTheme();
    theme.details = ThemeGetDetails(theme.theme, theme.primaryColor);
    this.state = theme;
    this.queryEvents = queryEvents;
  }

  saveTheme(theme) {
    const filtered = Object.keys(theme)
      .filter(key => THEME_STORAGE_FILTER.includes(key))
      .reduce((obj, key) => {
        obj[key] = theme[key];
        return obj;
      }, {});
    localStorage.setItem('theme', JSON.stringify(filtered));
  }

  setThemeState = (theme) => {
    this.setState(prevState => {
      theme = {...prevState, ...theme};
      this.saveTheme(theme);

      theme.details = ThemeGetDetails(theme.theme, theme.primaryColor);
      return theme;
    }, () => console.log(this.state))
  };

  onDarkModeChange = ({matches}) => {
    this.setThemeState(matches ? THEMES.DARK : THEMES.LIGHT)
  };

  componentDidMount() {
    this.queryEvents.addEventListener(this.onDarkModeChange);
  }

  componentWillUnmount() {
    this.queryEvents.removeEventListener(this.onDarkModeChange);
  }

  render() {
    return (
      <ThemeSetContext.Provider value={this.setThemeState}>
        <ThemeContext.Provider value={this.state}>
          {this.props.children}
        </ThemeContext.Provider>
      </ThemeSetContext.Provider>
    )
  }
}

export function ThemeProviderDeprecated(props) {
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
    localStorage.setItem('theme', JSON.stringify(filtered));

    const themeDetails = ThemeGetDetails(initialThemeState.theme, initialThemeState.primaryColor);
    setThemeState(prevState => ({...prevState, details: themeDetails}));

    console.log(initialThemeState);
  }, [initialThemeState.theme, initialThemeState.primaryColor]);

  return (
    <ThemeSetContext.Provider value={setThemeState}>
      <ThemeContext.Provider value={initialThemeState}>
        {props.children}
      </ThemeContext.Provider>
    </ThemeSetContext.Provider>
  )
}