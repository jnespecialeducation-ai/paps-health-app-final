'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from './ThemeProvider';
import { Button } from '../ui/Button';

export function DarkModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <Button
        variant="secondary"
        className="gap-2"
        aria-label="테마 전환"
      >
        <span className="h-4 w-4" />
        <span className="text-xs">Dark</span>
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      onClick={toggleTheme}
      className="gap-2"
      aria-label={resolvedTheme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
      suppressHydrationWarning
    >
      <FontAwesomeIcon 
        icon={resolvedTheme === 'dark' ? faSun : faMoon} 
        className="h-4 w-4"
      />
      <span className="text-xs">{resolvedTheme === 'dark' ? 'Light' : 'Dark'}</span>
    </Button>
  );
}
