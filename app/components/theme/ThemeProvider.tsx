'use client';

import { createContext, useContext, useEffect, useState, useCallback, PropsWithChildren } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((themeToApply: 'light' | 'dark') => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    // Tailwind는 dark 클래스만 인식하므로, light일 때는 제거, dark일 때는 추가
    if (themeToApply === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // 초기 테마 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setMounted(true);
    const saved = localStorage.getItem('theme') as Theme | null;
    const initialTheme = saved || 'dark';
    
    if (initialTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      setThemeState(initialTheme);
      setResolvedTheme(systemTheme);
      applyTheme(systemTheme);
    } else {
      setThemeState(initialTheme);
      setResolvedTheme(initialTheme);
      applyTheme(initialTheme);
    }
  }, [applyTheme]);

  // theme 변경 시 자동 적용
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    localStorage.setItem('theme', theme);
    
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      setResolvedTheme(systemTheme);
      applyTheme(systemTheme);

      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(newTheme);
        applyTheme(newTheme);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setResolvedTheme(theme);
      applyTheme(theme);
    }
  }, [theme, mounted, applyTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  // 항상 context를 제공하되, 마운트 전에는 기본값 사용
  const contextValue: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
