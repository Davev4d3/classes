import React from 'react';

const THEMES = {
  DARK: 'DARK',
  LIGHT: 'LIGHT'
};

// const [themeState, setThemeState] = React.useState({theme: 'light'});
const ThemeContext = React.createContext({theme: THEMES.LIGHT});

const useTheme = () => React.useContext(ThemeContext);

function getTheme() {
  const theme = window.localStorage.theme;
  if (theme && THEMES.hasOwnProperty(theme)) {
    const [themeState, setThemeState] = React.useState({theme: 'light'});
    setThemeState({theme: THEMES.theme})
  }
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