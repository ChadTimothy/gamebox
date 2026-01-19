/**
 * Theme Test Component
 *
 * Quick test to validate:
 * 1. Apps SDK UI integration
 * 2. Dark mode detection
 * 3. System color tokens
 */

import { useEffect, useState } from 'react';

export function ThemeTest() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Detect system theme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <div className="p-8 min-h-screen bg-[var(--background)]">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Theme Test
        </h1>

        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <p className="text-[var(--card-foreground)]">
            Current theme: <strong>{theme}</strong>
          </p>
          <p className="text-[var(--muted-foreground)] text-sm mt-2">
            This card uses Apps SDK UI color tokens
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="h-16 rounded bg-[var(--primary)] flex items-center justify-center">
            <span className="text-[var(--primary-foreground)] text-xs">Primary</span>
          </div>
          <div className="h-16 rounded bg-[var(--secondary)] flex items-center justify-center">
            <span className="text-[var(--secondary-foreground)] text-xs">Secondary</span>
          </div>
          <div className="h-16 rounded bg-[var(--accent)] flex items-center justify-center">
            <span className="text-[var(--accent-foreground)] text-xs">Accent</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[var(--muted)]">
          <p className="text-[var(--muted-foreground)] text-sm">
            Muted background with muted foreground text
          </p>
        </div>

        <button
          className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
          onClick={() => alert('Apps SDK UI button clicked!')}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}
