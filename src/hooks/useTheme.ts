import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

export const useTheme = () => {
  const { isDarkMode, toggleTheme, setTheme } = useThemeStore();

  useEffect(() => {
    // Update document class when theme changes
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return {
    isDarkMode,
    toggleTheme,
    setDarkMode: setTheme
  };
};
