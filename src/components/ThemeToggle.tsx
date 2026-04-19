import { useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(
    () => document.documentElement.classList.contains('dark')
  );

  function toggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    setDark(isDark);
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="bg-transparent border-0 cursor-pointer text-[var(--color-meta)] hover:text-[var(--color-text)] p-1 leading-none"
    >
      <span aria-hidden="true">{dark ? '☀️' : '🌙'}</span>
    </button>
  );
}
