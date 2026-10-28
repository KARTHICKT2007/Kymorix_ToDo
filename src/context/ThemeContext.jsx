import { useEffect, useState } from 'react';
import { loadThemeFromStorage, saveThemeToStorage } from '../utils/storage';
import { ThemeContext } from './themeContextDef';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(loadThemeFromStorage);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    document.body.className = theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark';
    saveThemeToStorage(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};
