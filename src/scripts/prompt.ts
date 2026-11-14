/**
 * The live prompt. Start typing anywhere and the site answers:
 *  - on the home page the giant › nml_ in the hero types with you,
 *  - everywhere else (or with / or Ctrl/⌘K) a small palette opens.
 * Both share one search over apps, posts, pages and a few commands.
 */
import { currentTheme, setTheme, toggleTheme } from './theme';

type Kind = 'Page' | 'App' | 'Post' | 'Command';

interface Item {
  label: string;
  kind: Kind;
  href?: string;
  /** Extra words to match on. */
  keys?: string;
  external?: boolean;
  /** Commands: do something. Return text to show as feedback and keep the prompt open. */
  run?: (query: string) => string | void;
  /** Commands: a short description shown on the right. */
  note?: () => string;
}

let site = { email: '', github: '' };
let indexPromise: Promise<Item[]> | null = null;

function commands(): Item[] {
  return [
    {
      label: 'theme',
      kind: 'Command',
      keys: 'dark light mode night colour color',
      note: () => (currentTheme() === 'dark' ? 'Switch to light' : 'Switch to dark'),
      run: (query) => {
        if (/\bdark\b|night/.test(query)) setTheme('dark');
        else if (/\blight\b/.test(query)) setTheme('light');
        else toggleTheme();
        return `Theme: ${currentTheme()}`;
      },
    },
    { label: 'github', kind: 'Command', keys: 'source code repositories git', href: site.github, external: true, note: () => 'Open GitHub' },
    {
      label: 'email',
      kind: 'Command',
      keys: 'contact mail address copy',
      note: () => 'Copy the address',
      run: () => {
        navigator.clipboard?.writeText(site.email).catch(() => {});
        return `Copied ${site.email}`;
      },
    },
    { label: 'rss', kind: 'Command', keys: 'feed subscribe', href: '/rss.xml', note: () => 'Open the feed' },
    { label: 'help', kind: 'Command', keys: 'commands ?', note: () => 'List commands' },
  ];
}

function loadIndex(): Promise<Item[]> {
  indexPromise ??= fetch('/search.json')
    .then((response) => response.json())
    .then((data: { items: Item[]; email: string; github: string }) => {
      site = { email: data.email, github: data.github };
      return [...data.items, ...commands()];
    })
    .catch(() => commands());
  return indexPromise;
}

function search(items: Item[], raw: string): Item[] {
  const query = raw.trim().toLowerCase();
  if (!query) return [];
  if (query === 'help' || query === '?') return items.filter((item) => item.kind === 'Command' && item.label !== 'help');

  const first = query.split(/\s+/)[0];
  const scored: { item: Item; score: number; order: number }[] = [];
  items.forEach((item, order) => {
    const label = item.label.toLowerCase();
    const keys = (item.keys ?? '').toLowerCase();
    let score = 0;
    if (label === query) score = 100;
    else if (label.startsWith(query)) score = 80;
    else if (label.split(/[^a-z0-9]+/).some((word) => word.startsWith(query))) score = 60;
    else if (label.includes(query)) score = 40;
    else if (item.kind === 'Command' && label === first) score = 70;
    else if (keys.split(/[^a-z0-9]+/).some((word) => word.startsWith(query))) score = 25;
    else if (keys.includes(query)) score = 10;
    if (score) scored.push({ item, score, order });
  });
  return scored
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, 7)
    .map((entry) => entry.item);
}

/** What the palette shows before anything is typed. */
function defaults(items: Item[]): Item[] {
  return items.filter((item) => item.kind === 'Page' || item.kind === 'App').slice(0, 9);
}

let uid = 0;

class PromptView {
  readonly input: HTMLInputElement;
  private list: HTMLElement;
  private typed: HTMLElement | null;
  private ghost: HTMLElement | null;
  private line: HTMLElement | null;
  private hero: HTMLElement | null;
  private results: Item[] = [];
  private active = 0;
  private id = `prompt-${++uid}`;
  private feedback = '';

  constructor(
    private root: HTMLElement,
    private mode: 'hero' | 'dialog',
  ) {
    this.input = root.querySelector<HTMLInputElement>('[data-prompt-input]')!;
    this.list = root.querySelector<HTMLElement>('[data-prompt-list]')!;
    this.typed = root.querySelector<HTMLElement>('[data-prompt-typed]');
    this.ghost = root.querySelector<HTMLElement>('[data-prompt-ghost]');
    this.line = root.querySelector<HTMLElement>('[data-prompt-line]');
    this.hero = mode === 'hero' ? root.closest<HTMLElement>('[data-hero]') : null;

    this.list.id ||= `${this.id}-list`;
    this.input.setAttribute('aria-controls', this.list.id);

    this.input.addEventListener('input', (event) => {
      this.feedback = '';
      this.update();
      if (this.mode === 'hero') this.pulse(event as InputEvent);
    });
    this.input.addEventListener('keydown', (event) => this.onKey(event));

    this.list.addEventListener('click', (event) => {
      const option = (event.target as HTMLElement).closest<HTMLElement>('[role="option"]');
      if (option) this.run(this.results[Number(option.dataset.index)]);
    });
    this.list.addEventListener('pointermove', (event) => {
      const option = (event.target as HTMLElement).closest<HTMLElement>('[role="option"]');
      if (option && Number(option.dataset.index) !== this.active) {
        this.active = Number(option.dataset.index);
        this.paintActive();
      }
    });
    // Keep focus in the input when a result is pressed, so blur doesn't clear the list first.
    this.list.addEventListener('pointerdown', (event) => event.preventDefault());

    if (mode === 'hero') {
      this.input.addEventListener('focus', () => root.toggleAttribute('data-focus', true));
      this.input.addEventListener('blur', () => {
        root.toggleAttribute('data-focus', false);
        if (!this.input.value.trim()) this.reset();
      });
      window.addEventListener('resize', () => this.fit());
    }
  }

  focus(prefill?: string) {
    if (prefill !== undefined) this.input.value = prefill;
    this.input.focus({ preventScroll: true });
    this.update();
  }

  reset() {
    this.input.value = '';
    this.feedback = '';
    this.update();
  }

  async update() {
    const items = await loadIndex();
    const query = this.input.value;
    this.results = query.trim() ? search(items, query) : this.mode === 'dialog' ? defaults(items) : [];
    this.active = 0;
    this.render();
  }

  private completion(): string {
    const query = this.input.value;
    const top = this.results[this.active] ?? this.results[0];
    if (!query || !top) return '';
    return top.label.toLowerCase().startsWith(query.toLowerCase()) ? top.label.slice(query.length) : '';
  }

  private render() {
    const query = this.input.value;
    const hasQuery = query.trim().length > 0;

    this.list.replaceChildren();
    this.results.forEach((item, index) => {
      const option = document.createElement('li');
      option.id = `${this.id}-option-${index}`;
      option.setAttribute('role', 'option');
      option.dataset.index = String(index);

      const label = document.createElement('span');
      label.className = 'prompt-option__label';
      label.textContent = item.label;

      const kind = document.createElement('span');
      kind.className = 'prompt-option__kind';
      kind.textContent = item.kind === 'Command' ? (item.note?.() ?? 'Command') : item.kind;

      option.append(label, kind);
      this.list.append(option);
    });

    if (this.feedback || (hasQuery && !this.results.length)) {
      const note = document.createElement('li');
      note.className = 'prompt-note';
      note.setAttribute('role', 'presentation');
      note.textContent = this.feedback || 'No matches. Type help to see the commands.';
      this.list.append(note);
    }

    const open = this.list.childElementCount > 0;
    this.list.hidden = !open;
    this.input.setAttribute('aria-expanded', String(open));
    this.paintActive();

    if (this.mode === 'hero') {
      this.root.toggleAttribute('data-typing', hasQuery);
      this.hero?.toggleAttribute('data-typing', hasQuery);
      if (hasQuery) this.root.toggleAttribute('data-seen', true);
      if (this.typed) this.typed.textContent = query;
      this.fit();
    }
  }

  private paintActive() {
    const options = this.list.querySelectorAll<HTMLElement>('[role="option"]');
    options.forEach((option, index) => option.setAttribute('aria-selected', String(index === this.active)));
    const current = options[this.active];
    if (current) this.input.setAttribute('aria-activedescendant', current.id);
    else this.input.removeAttribute('aria-activedescendant');
    if (this.ghost) this.ghost.textContent = this.completion();
    if (this.mode === 'hero') this.fit();
  }

  /** Shrinks the hero line so a long query still fits on one row. */
  private fit() {
    if (!this.line) return;
    this.line.style.fontSize = '';
    if (!this.input.value) return;
    const room = this.line.parentElement!.clientWidth;
    const size = parseFloat(getComputedStyle(this.line).fontSize);
    // The cursor bar hangs 0.6em past the text and is not part of scrollWidth.
    const need = this.line.scrollWidth + size * 0.6;
    if (need > room) this.line.style.fontSize = `${Math.max(26, (size * room) / need)}px`;
  }

  /** Tells the hero canvas a key was typed, so the paper can react. */
  private pulse(event: InputEvent) {
    if (!event.data || !this.line) return;
    const cursor = this.root.querySelector<HTMLElement>('[data-prompt-cursor]');
    const box = (cursor ?? this.line).getBoundingClientRect();
    window.dispatchEvent(
      new CustomEvent('nml:key', {
        detail: { char: event.data.slice(-1), x: box.left + box.width / 2, y: box.top + box.height / 2 },
      }),
    );
  }

  private onKey(event: KeyboardEvent) {
    const count = this.results.length;
    if (event.key === 'ArrowDown' && count) {
      event.preventDefault();
      this.active = (this.active + 1) % count;
      this.paintActive();
    } else if (event.key === 'ArrowUp' && count) {
      event.preventDefault();
      this.active = (this.active - 1 + count) % count;
      this.paintActive();
    } else if (event.key === 'Tab' && !event.shiftKey && this.completion()) {
      event.preventDefault();
      this.input.value += this.completion();
      this.update();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = this.results[this.active];
      if (item) this.run(item);
    } else if (event.key === 'Escape' && this.mode === 'hero') {
      event.preventDefault();
      this.reset();
      this.input.blur();
    }
  }

  private run(item: Item | undefined) {
    if (!item) return;

    if (item.label === 'help' && item.kind === 'Command') {
      this.input.value = 'help';
      this.update();
      return;
    }

    if (item.run) {
      this.feedback = item.run(this.input.value.toLowerCase()) ?? '';
      this.render();
      return;
    }

    if (item.href) {
      if (item.external) window.open(item.href, '_blank', 'noopener');
      else window.location.assign(item.href);
    }
  }
}

export function initPrompt() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-prompt-dialog]');
  const heroRoot = document.querySelector<HTMLElement>('[data-prompt-hero]');
  if (!dialog) return;

  const palette = new PromptView(dialog, 'dialog');
  const hero = heroRoot ? new PromptView(heroRoot, 'hero') : null;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

  const openPalette = () => {
    if (!dialog.open) dialog.showModal();
    palette.focus('');
  };

  /** True while the hero line is on screen, so typing should land there. */
  const heroInView = () => {
    if (!heroRoot || !finePointer.matches) return false;
    const box = heroRoot.getBoundingClientRect();
    return box.top > 0 && box.bottom < window.innerHeight;
  };

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => palette.reset());

  document.querySelectorAll<HTMLElement>('[data-prompt-open]').forEach((button) => {
    button.addEventListener('click', openPalette);
  });

  // The suggestion chips under the hero prompt.
  document.querySelectorAll<HTMLElement>('[data-prompt-fill]').forEach((button) => {
    button.addEventListener('click', () => {
      const word = button.dataset.promptFill ?? '';
      if (hero && finePointer.matches) hero.focus(word);
      else {
        openPalette();
        palette.focus(word);
      }
    });
  });

  // On touch screens the hero prompt opens the palette instead of typing in place.
  heroRoot?.addEventListener('click', () => {
    if (!finePointer.matches) openPalette();
  });
  hero?.input.addEventListener('focus', () => {
    if (!finePointer.matches) {
      hero.input.blur();
      openPalette();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.defaultPrevented) return;

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (dialog.open) dialog.close();
      else openPalette();
      return;
    }

    const target = event.target as HTMLElement | null;
    const editing = target?.closest('input, textarea, select, [contenteditable]');
    if (editing || dialog.open || event.metaKey || event.ctrlKey || event.altKey) return;

    const slash = event.key === '/';
    const typing = event.key.length === 1 && /[a-z0-9]/i.test(event.key);
    if (!slash && !typing) return;

    if (slash) event.preventDefault();
    // Focus moves during keydown, so the character itself is typed into the prompt.
    if (heroInView()) hero!.focus();
    else openPalette();
  });

  // Fetch the index when the browser is idle so the first keystroke is instant.
  const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 1200));
  idle(() => void loadIndex());
}
