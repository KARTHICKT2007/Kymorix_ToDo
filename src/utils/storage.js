const THEME_KEY = 'kymorix_theme';
const POMO_KEY = 'kymorix_pomodoro';

export const loadThemeFromStorage = () => {
  try {
    const theme = localStorage.getItem(THEME_KEY) || localStorage.getItem('focusflow_theme');
    if (theme === 'dark' || theme === 'light') return theme;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
};

export const saveThemeToStorage = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
};

export const loadPomodoroSettings = () => {
  try {
    const raw = localStorage.getItem(POMO_KEY) || localStorage.getItem('focusflow_pomodoro');
    if (!raw) {
      return {
        focusDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4,
        autoStartBreaks: false,
        soundEnabled: true
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreaks: false,
      soundEnabled: true
    };
  }
};

export const savePomodoroSettings = (settings) => {
  try {
    localStorage.setItem(POMO_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save pomodoro settings', e);
  }
};
