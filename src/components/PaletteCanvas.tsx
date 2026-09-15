import { useEffect, useRef } from 'react';
import { useMotionPref } from '../hooks/useMotionPref';

/**
 * Deterministic generative composition drawn from a piece's palette.
 * Same slug always yields the same artwork — it is a signature, not random noise.
 */
export default function PaletteCanvas({ seed, palette }: { seed: string; palette: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useMotionPref();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rng = 2166136261;
    for (let i = 0; i < seed.length; i += 1) {
      rng ^= seed.charCodeAt(i);
      rng = Math.imul(rng, 16777619);
    }
    const rand = () => {
      rng ^= rng << 13;
      rng ^= rng >>> 17;
      rng ^= rng << 5;
      return ((rng >>> 0) % 100000) / 100000;
    };

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    const shapes = Array.from({ length: 26 }, () => ({
      x: rand(),
      y: rand(),
      w: 0.08 + rand() * 0.42,
      h: 0.02 + rand() * 0.1,
      rot: (rand() - 0.5) * 1.1,
      c: palette[Math.floor(rand() * palette.length)],
      speed: 0.15 + rand() * 0.5,
      round: rand() > 0.55,
    }));

    const draw = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, palette[0]);
      grad.addColorStop(1, palette[1] ?? palette[0]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      shapes.forEach((s, idx) => {
        const drift = reduced ? 0 : Math.sin(time * 0.00035 * s.speed + idx) * 0.05;
        ctx.save();
        ctx.translate((s.x + drift) * w, s.y * h);
        ctx.rotate(s.rot);
        ctx.globalAlpha = 0.28 + (idx % 4) * 0.14;
        ctx.fillStyle = s.c;
        const sw = s.w * w;
        const sh = s.h * h;
        if (s.round) {
          ctx.beginPath();
          ctx.ellipse(0, 0, sw / 2, sh / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
        }
        ctx.restore();
      });

      // grid overlay for the "design system" read
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = palette[palette.length - 1];
      ctx.lineWidth = 1;
      for (let gx = 0; gx <= w; gx += w / 8) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (let gy = 0; gy <= h; gy += h / 5) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (!reduced) raf = window.requestAnimationFrame(draw);
    };

    raf = window.requestAnimationFrame(draw);
    const onResize = () => {
      if (reduced) draw(0);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [seed, palette, reduced]);

  return <canvas ref={ref} className="palette-canvas" aria-hidden="true" />;
}
