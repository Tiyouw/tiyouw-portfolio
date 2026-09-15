import { useEffect, useRef, useState } from 'react';
import { useMotionPref } from '../hooks/useMotionPref';

/**
 * Timeline scrubber that visualises an edit's real metadata (duration + cut count):
 * cut markers are laid out on a pacing curve, and a playhead sweeps the strip.
 */
export default function EditStrip({
  seed,
  cuts,
  duration,
  playing,
}: {
  seed: string;
  cuts: number;
  duration: string;
  playing: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useMotionPref();
  const [seconds, setSeconds] = useState(0);

  const total = (() => {
    const [m, s] = duration.split(':').map(Number);
    return m * 60 + s;
  })();

  useEffect(() => {
    if (!playing || reduced) return;
    const started = performance.now() - seconds * 1000;
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = ((now - started) / 1000) % total;
      setSeconds(elapsed);
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, reduced, total]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rng = 5381;
    for (let i = 0; i < seed.length; i += 1) rng = (rng * 33) ^ seed.charCodeAt(i);
    const rand = () => {
      rng ^= rng << 13;
      rng ^= rng >>> 17;
      rng ^= rng << 5;
      return ((rng >>> 0) % 10000) / 10000;
    };

    const marks = Array.from({ length: cuts }, (_, i) => {
      const base = i / cuts;
      const jitter = (rand() - 0.5) * (0.7 / cuts);
      return Math.min(0.999, Math.max(0.001, base + jitter));
    }).sort((a, b) => a - b);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // pacing curve: shot length between cuts
    ctx.beginPath();
    ctx.moveTo(0, h);
    marks.forEach((m, i) => {
      const prev = i === 0 ? 0 : marks[i - 1];
      const len = m - prev;
      const y = h - Math.min(1, len * cuts * 0.85) * (h * 0.8) - h * 0.08;
      ctx.lineTo(m * w, y);
    });
    ctx.lineTo(w, h);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(113,112,255,0.42)');
    g.addColorStop(0.55, 'rgba(245,182,74,0.34)');
    g.addColorStop(1, 'rgba(47,214,164,0.4)');
    ctx.fillStyle = g;
    ctx.fill();

    // cut markers
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    marks.forEach((m) => {
      ctx.beginPath();
      ctx.moveTo(m * w, h * 0.12);
      ctx.lineTo(m * w, h);
      ctx.stroke();
    });

    // playhead
    const p = total ? seconds / total : 0;
    ctx.strokeStyle = '#f7f8f8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p * w, 0);
    ctx.lineTo(p * w, h);
    ctx.stroke();
    ctx.fillStyle = '#f7f8f8';
    ctx.beginPath();
    ctx.arc(p * w, 4, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }, [seed, cuts, seconds, total]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(Math.floor(seconds % 60)).padStart(2, '0');

  return (
    <div className="edit-strip">
      <canvas ref={ref} className="edit-strip__canvas" aria-hidden="true" />
      <div className="edit-strip__time">
        <span>
          {mm}:{ss}
        </span>
        <span>{duration}</span>
      </div>
    </div>
  );
}
