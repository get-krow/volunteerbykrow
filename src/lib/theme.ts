'use client';

import { useState, useEffect } from 'react';

export function getInitialTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('krow_theme');
    if (saved === 'dark' || saved === 'light') return saved;
  }
  return 'light';
}

export function applyTheme(theme: 'light' | 'dark') {
  if (typeof window === 'undefined') return;
  localStorage.setItem('krow_theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function toggleTheme(): 'light' | 'dark' {
  const current = typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const handleToggle = () => {
    const next = toggleTheme();
    setTheme(next);
  };

  return { theme, toggleTheme: handleToggle };
}
