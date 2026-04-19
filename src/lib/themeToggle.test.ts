import { describe, it, expect, beforeEach } from 'vitest';
import { applyTheme, initThemeToggle } from './themeToggle';

function makeElements() {
  const btn = document.createElement('button');
  const icon = document.createElement('span');
  return { btn, icon };
}

describe('applyTheme()', () => {
  describe('when dark is true', () => {
    it('sets the sun emoji', () => {
      const { btn, icon } = makeElements();
      applyTheme(true, btn, icon);
      expect(icon.textContent).toBe('☀️');
    });

    it('sets aria-label to switch to light mode', () => {
      const { btn, icon } = makeElements();
      applyTheme(true, btn, icon);
      expect(btn.getAttribute('aria-label')).toBe('Switch to light mode');
    });
  });

  describe('when dark is false', () => {
    it('sets the moon emoji', () => {
      const { btn, icon } = makeElements();
      applyTheme(false, btn, icon);
      expect(icon.textContent).toBe('🌙');
    });

    it('sets aria-label to switch to dark mode', () => {
      const { btn, icon } = makeElements();
      applyTheme(false, btn, icon);
      expect(btn.getAttribute('aria-label')).toBe('Switch to dark mode');
    });
  });
});

describe('initThemeToggle()', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });

  describe('when initialized in light mode', () => {
    it('shows the moon emoji', () => {
      const { btn, icon } = makeElements();
      initThemeToggle(btn, icon);
      expect(icon.textContent).toBe('🌙');
    });
  });

  describe('when initialized in dark mode', () => {
    it('shows the sun emoji', () => {
      document.documentElement.classList.add('dark');
      const { btn, icon } = makeElements();
      initThemeToggle(btn, icon);
      expect(icon.textContent).toBe('☀️');
    });
  });

  describe('when the button is clicked', () => {
    it('toggles dark class on <html>', () => {
      const { btn, icon } = makeElements();
      initThemeToggle(btn, icon);
      btn.click();
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('persists the theme to localStorage', () => {
      const { btn, icon } = makeElements();
      initThemeToggle(btn, icon);
      btn.click();
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('updates the emoji after toggle', () => {
      const { btn, icon } = makeElements();
      initThemeToggle(btn, icon);
      btn.click();
      expect(icon.textContent).toBe('☀️');
    });

    it('reverts to light mode on second click', () => {
      const { btn, icon } = makeElements();
      initThemeToggle(btn, icon);
      btn.click();
      btn.click();
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorage.getItem('theme')).toBe('light');
      expect(icon.textContent).toBe('🌙');
    });
  });
});
