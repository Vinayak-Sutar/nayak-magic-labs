/** Light / dark theme. The choice is stored and applied before first paint by BaseLayout. */

export type Theme = 'light' | 'dark';

const KEY = 'nml-theme';
const THEME_COLOR: Record<Theme, string> = { light: '#f2f2ee', dark: '#0c0d10' };

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function syncControls(theme: Theme) {
  document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((button) => {
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  });
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // Private mode or blocked storage: the theme still applies for this page.
  }
  syncControls(theme);
  // The hero canvas redraws in the new colours.
  window.dispatchEvent(new CustomEvent('nml:theme', { detail: theme }));
}

export function toggleTheme(): Theme {
  const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

export function initTheme() {
  syncControls(currentTheme());
  document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => toggleTheme());
  });
}
