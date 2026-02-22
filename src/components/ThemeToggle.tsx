import { useEffect, useState, useRef } from 'react';
import { Sun, Moon } from 'lucide-react';

const THEME_KEY = 'theme';

const ThemeToggle = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      if (typeof window === 'undefined') return 'dark';
      const stored = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
      if (stored) return stored;
      // Fallback to system preference
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      // ignore
    }

    // update aria-pressed on the button for screen readers
    try {
      btnRef.current?.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    } catch (e) {/* ignore */}
  }, [theme]);

  useEffect(() => {
    // Listen to system changes only if user hasn't explicitly set a theme
    const stored = localStorage.getItem(THEME_KEY);
    if (!stored && window.matchMedia) {
      const mql = window.matchMedia('(prefers-color-scheme: light)');
      const handler = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? 'light' : 'dark');
      };
      // Use standard addEventListener when available
      mql.addEventListener?.('change', handler);
      return () => {
        mql.removeEventListener?.('change', handler);
      };
    }
  }, []);

  const toggle = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <button
      ref={btnRef}
      onClick={toggle}
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      title={theme === 'light' ? 'Switch to dark' : 'Switch to light'}
      className="inline-flex items-center justify-center p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
