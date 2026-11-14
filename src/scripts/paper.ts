/**
 * The hero "paper": a grid of faint mono glyphs that wake up near the pointer
 * and ripple when a key is typed into the prompt. It only animates while
 * something is changing; at rest it is a still image and costs nothing.
 */

interface Cell {
  x: number;
  y: number;
  base: string;
  word: string;
  k: number;
}

interface Pulse {
  x: number;
  y: number;
  t: number;
  char: string;
}

interface Zone {
  l: number;
  t: number;
  r: number;
  b: number;
}

const CELL = 26;
const REACH = 190;
const PULSE_LIFE = 1.3;
const PULSE_SPEED = 620;
const PULSE_BAND = 48;
const BASE = ['·', '·', '·', ':', '·', ';', '·', '>'];
const WORD = ['›', 'n', 'm', 'l', '_'];
const FONT = '"Martian Mono Variable", "Martian Mono", ui-monospace, monospace';

/** Reads a hex colour token and returns it as "r,g,b" for rgba(). */
function token(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const match = /^#([0-9a-f]{6})$/i.exec(value);
  if (!match) return fallback;
  const n = parseInt(match[1], 16);
  return `${n >> 16},${(n >> 8) & 255},${n & 255}`;
}

export function startPaper(canvas: HTMLCanvasElement): () => void {
  const host = canvas.parentElement;
  const ctx = canvas.getContext('2d');
  if (!host || !ctx) return () => {};

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, on: 0, goal: 0 };
  let width = 0;
  let height = 0;
  let ratio = 1;
  let cells: Cell[] = [];
  let pulses: Pulse[] = [];
  let ink = token('--ink', '11,11,12');
  let accent = token('--accent', '43,75,242');
  let frameId = 0;
  let running = false;
  let visible = true;

  function layout() {
    const box = host!.getBoundingClientRect();
    ratio = Math.min(2, window.devicePixelRatio || 1);
    width = box.width;
    height = box.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);

    // Keep glyphs out from under running text.
    const zones: Zone[] = [...host!.querySelectorAll<HTMLElement>('[data-paper-avoid]')].map((element) => {
      const b = element.getBoundingClientRect();
      return { l: b.left - box.left - 20, t: b.top - box.top - 16, r: b.right - box.left + 20, b: b.bottom - box.top + 16 };
    });

    cells = [];
    const cols = Math.ceil(width / CELL) + 1;
    const rows = Math.ceil(height / CELL) + 1;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * CELL + CELL / 2;
        const y = row * CELL + CELL / 2;
        if (zones.some((zone) => x > zone.l && x < zone.r && y > zone.t && y < zone.b)) continue;
        cells.push({
          x,
          y,
          base: BASE[(col * 7 + row * 13) % BASE.length],
          word: WORD[(col + row * 3) % WORD.length],
          k: 0,
        });
      }
    }
  }

  function draw(now: number) {
    const time = now / 1000;
    pointer.x += (pointer.tx - pointer.x) * 0.18;
    pointer.y += (pointer.ty - pointer.y) * 0.18;
    pointer.on += (pointer.goal - pointer.on) * 0.08;
    pulses = pulses.filter((pulse) => time - pulse.t < PULSE_LIFE);

    ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx!.clearRect(0, 0, width, height);

    // A soft cobalt light under the pointer.
    if (pointer.on > 0.01) {
      const radius = Math.max(width, height) * 0.32;
      const glow = ctx!.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);
      glow.addColorStop(0, `rgba(${accent},${0.17 * pointer.on})`);
      glow.addColorStop(0.5, `rgba(${accent},${0.055 * pointer.on})`);
      glow.addColorStop(1, `rgba(${accent},0)`);
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, width, height);
    }

    ctx!.textAlign = 'center';
    ctx!.textBaseline = 'middle';
    let weight = '';
    let moving = pulses.length > 0 || Math.abs(pointer.goal - pointer.on) > 0.01 || Math.hypot(pointer.tx - pointer.x, pointer.ty - pointer.y) > 0.5;

    for (const cell of cells) {
      let energy = 0;
      if (pointer.on > 0.01) {
        const near = Math.max(0, 1 - Math.hypot(pointer.x - cell.x, pointer.y - cell.y) / REACH) * pointer.on;
        energy = near * near * (3 - 2 * near);
      }
      cell.k += (energy - cell.k) * (energy > cell.k ? 0.25 : 0.05);
      if (cell.k > 0.01) moving = true;

      let glyph = cell.base;
      let alpha = 0.12 + cell.k * 0.14;
      let bold = false;
      let hot = false;
      if (cell.k > 0.32) {
        glyph = cell.word;
        alpha = 0.2 + cell.k * 0.6;
        bold = true;
      }

      for (const pulse of pulses) {
        const age = time - pulse.t;
        const off = Math.abs(Math.hypot(pulse.x - cell.x, pulse.y - cell.y) - age * PULSE_SPEED);
        if (off >= PULSE_BAND) continue;
        const strength = (1 - off / PULSE_BAND) * (1 - age / PULSE_LIFE);
        if (strength > alpha) {
          glyph = pulse.char;
          alpha = strength * 0.9;
          bold = true;
          hot = true;
        }
      }

      const next = bold ? '500' : '400';
      if (next !== weight) {
        weight = next;
        ctx!.font = `${weight} 13px ${FONT}`;
      }
      ctx!.fillStyle = `rgba(${hot ? accent : ink},${alpha})`;
      ctx!.fillText(glyph, cell.x, cell.y);
    }

    if (moving && visible && !reduced) {
      running = true;
      frameId = requestAnimationFrame(draw);
    } else {
      running = false;
    }
  }

  /** Starts the loop if it is asleep. Under reduced motion it paints one still frame. */
  function wake() {
    if (running || !visible) return;
    if (reduced) {
      draw(performance.now());
      return;
    }
    running = true;
    frameId = requestAnimationFrame(draw);
  }

  const onMove = (event: PointerEvent) => {
    if (reduced) return;
    const box = host.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    const inside = x >= 0 && y >= 0 && x <= box.width && y <= box.height;
    if (pointer.on < 0.02 && inside) {
      pointer.x = x;
      pointer.y = y;
    }
    pointer.tx = x;
    pointer.ty = y;
    pointer.goal = inside ? 1 : 0;
    wake();
  };
  const onLeave = () => {
    pointer.goal = 0;
    wake();
  };
  const onKey = (event: Event) => {
    if (reduced) return;
    const { char, x, y } = (event as CustomEvent<{ char: string; x: number; y: number }>).detail;
    if (!char.trim()) return;
    const box = host.getBoundingClientRect();
    pulses.push({ x: x - box.left, y: y - box.top, t: performance.now() / 1000, char });
    wake();
  };
  const onTheme = () => {
    ink = token('--ink', ink);
    accent = token('--accent', accent);
    running = false;
    cancelAnimationFrame(frameId);
    draw(performance.now());
  };

  const resize = new ResizeObserver(() => {
    layout();
    running = false;
    cancelAnimationFrame(frameId);
    draw(performance.now());
  });
  const inView = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
  });

  resize.observe(host);
  inView.observe(canvas);
  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  window.addEventListener('nml:key', onKey);
  window.addEventListener('nml:theme', onTheme);

  layout();
  draw(performance.now());
  // Repaint once the mono font has loaded, so the glyphs are the right ones.
  document.fonts?.ready.then(() => draw(performance.now()));

  return () => {
    cancelAnimationFrame(frameId);
    resize.disconnect();
    inView.disconnect();
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('nml:key', onKey);
    window.removeEventListener('nml:theme', onTheme);
  };
}
