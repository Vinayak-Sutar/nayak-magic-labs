/**
 * The slowly turning sphere of points from the v4 hero. It sits to the right of
 * the mark, on top of the paper canvas. The pointer steers its tilt, pushes
 * nearby points aside and lights the side it is closest to.
 */

interface Point {
  x: number;
  y: number;
  z: number;
  ox: number;
  oy: number;
}

interface Zone {
  l: number;
  t: number;
  r: number;
  b: number;
}

const COUNT = 900;

function token(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const match = /^#([0-9a-f]{6})$/i.exec(value);
  if (!match) return fallback;
  const n = parseInt(match[1], 16);
  return `${n >> 16},${(n >> 8) & 255},${n & 255}`;
}

export function startSphere(canvas: HTMLCanvasElement): () => void {
  const host = canvas.parentElement;
  const ctx = canvas.getContext('2d');
  if (!host || !ctx) return () => {};

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Points spread evenly over a unit sphere.
  const points: Point[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    points.push({ x: Math.cos(golden * i) * r, y, z: Math.sin(golden * i) * r, ox: 0, oy: 0 });
  }

  const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, on: 0, goal: 0 };
  const light = { x: 0, y: 0, r: 400 };
  const turn = { y: 0, x: -0.25 };
  let width = 0;
  let height = 0;
  let ratio = 1;
  let cx = 0;
  let cy = 0;
  let radius = 100;
  let zones: Zone[] = [];
  let ink = token('--ink', '11,11,12');
  let frameId = 0;
  let visible = true;

  function layout() {
    const box = host!.getBoundingClientRect();
    ratio = Math.min(2, window.devicePixelRatio || 1);
    width = box.width;
    height = box.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);

    zones = [...host!.querySelectorAll<HTMLElement>('[data-paper-avoid]')].map((element) => {
      const b = element.getBoundingClientRect();
      return { l: b.left - box.left - 12, t: b.top - box.top - 12, r: b.right - box.left + 12, b: b.bottom - box.top + 12 };
    });

    // Right of the mark on wide screens, centred behind it on narrow ones.
    const narrow = width < 820;
    cx = narrow ? width * 0.5 : width * 0.74;
    cy = height * (narrow ? 0.3 : 0.4);
    radius = Math.min(narrow ? width * 0.42 : width * 0.24, height * 0.36);

    // Stay clear of the headline row underneath.
    const row = host!.querySelector<HTMLElement>('[data-sphere-floor]');
    if (row) {
      const top = row.getBoundingClientRect().top - box.top - 32;
      if (cy + radius > top) {
        radius = Math.max(60, Math.min(radius, top * 0.48));
        cy = Math.max(radius + 16, top - radius);
      }
    }
  }

  const inZone = (x: number, y: number) => zones.some((z) => x > z.l && x < z.r && y > z.t && y < z.b);

  function draw(now: number) {
    const time = now / 1000;
    pointer.x += (pointer.tx - pointer.x) * 0.16;
    pointer.y += (pointer.ty - pointer.y) * 0.16;
    pointer.on += (pointer.goal - pointer.on) * 0.06;
    const active = pointer.on > 0.05;

    // The light follows the pointer, and drifts on its own when there is none.
    const lx = active ? pointer.x : width * (0.6 + Math.sin(time * 0.2) * 0.2);
    const ly = active ? pointer.y : height * (0.4 + Math.cos(time * 0.17) * 0.15);
    if (!light.x) {
      light.x = lx;
      light.y = ly;
    }
    light.x += (lx - light.x) * 0.05;
    light.y += (ly - light.y) * 0.05;
    light.r = Math.max(width, height) * 0.32;

    const tiltGoal = active ? ((pointer.y - cy) / height) * 1.2 - 0.25 : -0.25;
    turn.y += 0.0022 + (active ? ((pointer.x - cx) / width) * 0.01 : 0);
    turn.x += (tiltGoal - turn.x) * 0.04;
    const cosY = Math.cos(turn.y);
    const sinY = Math.sin(turn.y);
    const cosX = Math.cos(turn.x);
    const sinX = Math.sin(turn.x);

    const drawn: [number, number, number, number][] = [];
    for (const p of points) {
      const x = p.x * cosY + p.z * sinY;
      let z = -p.x * sinY + p.z * cosY;
      const y = p.y * cosX - z * sinX;
      z = p.y * sinX + z * cosX;
      const scale = 2.6 / (2.6 + z);
      const sx = cx + x * radius * scale;
      const sy = cy + y * radius * scale;

      const dx = sx - pointer.x;
      const dy = sy - pointer.y;
      const dist = Math.hypot(dx, dy) || 1;
      const push = Math.max(0, 1 - dist / 120) * pointer.on * (z < 0.2 ? 1 : 0.3);
      p.ox += ((dx / dist) * push * 34 - p.ox) * 0.15;
      p.oy += ((dy / dist) * push * 34 - p.oy) * 0.15;
      drawn.push([sx + p.ox, sy + p.oy, z, push]);
    }
    drawn.sort((a, b) => b[2] - a[2]);

    ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx!.clearRect(0, 0, width, height);
    for (const [x, y, z, push] of drawn) {
      const front = (1 - z) / 2;
      const lit = Math.max(0, 1 - Math.hypot(x - light.x, y - light.y) / (light.r * 0.8));
      const alpha = Math.min(0.95, (0.08 + front * 0.62) * (0.45 + lit * 1.1)) * (inZone(x, y) ? 0.3 : 1);
      ctx!.fillStyle = `rgba(${ink},${alpha})`;
      ctx!.beginPath();
      ctx!.arc(x, y, 0.7 + front * 1.5 + push * 0.8 + lit * 0.6, 0, Math.PI * 2);
      ctx!.fill();
    }

    if (visible && !reduced) frameId = requestAnimationFrame(draw);
  }

  const restart = () => {
    cancelAnimationFrame(frameId);
    if (visible) frameId = requestAnimationFrame(draw);
  };

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
  };
  const onLeave = () => {
    pointer.goal = 0;
  };
  const onTheme = () => {
    ink = token('--ink', ink);
    restart();
  };

  const resize = new ResizeObserver(() => {
    layout();
    restart();
  });
  const inView = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    restart();
  });

  resize.observe(host);
  inView.observe(canvas);
  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  window.addEventListener('nml:theme', onTheme);

  layout();
  restart();

  return () => {
    cancelAnimationFrame(frameId);
    resize.disconnect();
    inView.disconnect();
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('nml:theme', onTheme);
  };
}
