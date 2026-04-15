"use client";

import { useState } from 'react';

const STORAGE_KEY = 'clearup_theme';

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document === 'undefined') {
      return 'light';
    }

    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  });

  function handleToggle() {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="block w-full rounded-2xl border border-[var(--line)] bg-white/80 p-3 text-center text-xs font-bold uppercase tracking-[0.22em] text-[var(--foreground)] transition hover:bg-white"
    >
      {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
    </button>
  );
}
