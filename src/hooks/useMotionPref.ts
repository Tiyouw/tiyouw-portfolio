import { useEffect, useState } from 'react';

const KEY = 'tiyouw.reduceMotion';

function systemPref(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function stored(): boolean | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(KEY);
  return v === '1' ? true : v === '0' ? false : null;
}

/** Reads reduced-motion state; user override wins over the OS setting. */
export function useMotionPref(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => stored() ?? systemPref());

  useEffect(() => {
    const onChange = () => setReduced(stored() ?? systemPref());
    window.addEventListener('tiyouw:motion', onChange);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', onChange);
    return () => {
      window.removeEventListener('tiyouw:motion', onChange);
      mq.removeEventListener('change', onChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = reduced ? 'true' : 'false';
  }, [reduced]);

  return reduced;
}

export function setMotionPref(reduced: boolean) {
  window.localStorage.setItem(KEY, reduced ? '1' : '0');
  window.dispatchEvent(new Event('tiyouw:motion'));
}
