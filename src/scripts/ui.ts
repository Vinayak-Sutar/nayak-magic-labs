/** Small page behaviours shared by every page: scroll reveal, mobile menu, code copy buttons. */

declare global {
  interface Window {
    __nmlReady?: boolean;
  }
}

/** Adds .is-in to [data-reveal] elements the first time they scroll into view. */
export function initReveal() {
  window.__nmlReady = true;
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-in'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const item = entry.target as HTMLElement;
        item.classList.add('is-in');
        observer.unobserve(item);
        // Once shown, drop the attribute so the element's own hover transitions take over.
        setTimeout(() => {
          item.removeAttribute('data-reveal');
          item.classList.remove('is-in');
        }, 1600);
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
  );
  items.forEach((item) => observer.observe(item));
}

/** The header menu on narrow screens. */
export function initMenu() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const toggle = header?.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  if (!header || !toggle) return;

  const set = (open: boolean) => {
    header.toggleAttribute('data-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => set(!header.hasAttribute('data-open')));
  header.querySelectorAll('.nav a').forEach((link) => link.addEventListener('click', () => set(false)));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.hasAttribute('data-open')) {
      set(false);
      toggle.focus();
    }
  });
  matchMedia('(min-width: 881px)').addEventListener('change', () => set(false));
}

/** Wraps each code block in long-form text and gives it a Copy button. */
export function initCodeCopy() {
  document.querySelectorAll<HTMLPreElement>('.prose pre').forEach((pre) => {
    if (pre.parentElement?.classList.contains('code')) return;

    const wrap = document.createElement('div');
    wrap.className = 'code';
    pre.replaceWith(wrap);
    wrap.append(pre);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code__copy';
    button.textContent = 'Copy';
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.innerText);
        button.textContent = 'Copied';
      } catch {
        button.textContent = 'Press Ctrl+C';
      }
      setTimeout(() => (button.textContent = 'Copy'), 1400);
    });
    wrap.append(button);
  });
}
