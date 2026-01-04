import React from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import ruRU from 'antd/locale/ru_RU';

type AppTheme = 'light' | 'dark';

type ThemeContextValue = {
  theme: AppTheme;
  toggleTheme: () => void;
  setTheme: (t: AppTheme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'app_theme';

function getInitialTheme(): AppTheme {
  const saved = localStorage.getItem(STORAGE_KEY) as AppTheme | null;
  return saved === 'dark' || saved === 'light' ? saved : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<AppTheme>(getInitialTheme);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    }),
    [theme]
  );

  const algorithm =
    theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        locale={ruRU}
        theme={{
          algorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
}
