'use client';

import { useEffect } from 'react';

export function applyTheme() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('krow_theme');
  document.documentElement.classList.remove('dark');
}

export function useTheme() {
  useEffect(() => {
    applyTheme();
  }, []);

  return { theme: 'light', toggleTheme: () => {} };
}
