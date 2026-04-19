import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import ThemeToggle from './ThemeToggle';

describe('ThemeToggle()', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });

  describe('when rendered in light mode', () => {
    it('displays the moon icon', () => {
      render(<ThemeToggle />);
      expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
    });
  });

  describe('when rendered with .dark already on <html>', () => {
    it('displays the sun icon', () => {
      document.documentElement.classList.add('dark');
      render(<ThemeToggle />);
      expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
    });
  });

  describe('when the button is clicked in light mode', () => {
    it('adds .dark to document.documentElement', async () => {
      render(<ThemeToggle />);
      await userEvent.click(screen.getByRole('button'));
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('persists dark to localStorage', async () => {
      render(<ThemeToggle />);
      await userEvent.click(screen.getByRole('button'));
      expect(localStorage.getItem('theme')).toBe('dark');
    });
  });

  describe('when the button is clicked in dark mode', () => {
    it('removes .dark from document.documentElement', async () => {
      document.documentElement.classList.add('dark');
      render(<ThemeToggle />);
      await userEvent.click(screen.getByRole('button'));
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('persists light to localStorage', async () => {
      document.documentElement.classList.add('dark');
      render(<ThemeToggle />);
      await userEvent.click(screen.getByRole('button'));
      expect(localStorage.getItem('theme')).toBe('light');
    });
  });

  describe('when toggled twice', () => {
    it('returns to light mode', async () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button');
      await userEvent.click(button);
      await userEvent.click(button);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
});
