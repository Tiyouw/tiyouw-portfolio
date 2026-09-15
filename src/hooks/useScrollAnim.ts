import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Lenis smooth scroll wired into GSAP ScrollTrigger; disabled when motion is reduced. */
export function useSmoothScroll(reduced: boolean) {
  useEffect(() => {
    if (reduced) {
      ScrollTrigger.refresh();
      return;
    }
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [reduced]);
}

/** Staggered reveal for every [data-reveal] element inside the given root. */
export function useReveals(reduced: boolean) {
  useEffect(() => {
    const nodes = gsap.utils.toArray<HTMLElement>('[data-reveal]');
    if (reduced) {
      gsap.set(nodes, { autoAlpha: 1, y: 0, clearProps: 'transform' });
      ScrollTrigger.refresh();
      return;
    }

    const triggers: ScrollTrigger[] = [];
    nodes.forEach((node) => {
      const delay = Number(node.dataset.revealDelay ?? 0);
      const tween = gsap.fromTo(
        node,
        { autoAlpha: 0, y: 34 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: node, start: 'top 88%', once: true },
        },
      );
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });

    // horizontal drift on marquee rails
    gsap.utils.toArray<HTMLElement>('[data-rail]').forEach((rail) => {
      const dir = rail.dataset.rail === 'reverse' ? 1 : -1;
      const tween = gsap.to(rail, {
        xPercent: 12 * dir,
        ease: 'none',
        scrollTrigger: { trigger: rail, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      });
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });

    // section headline mask wipe
    gsap.utils.toArray<HTMLElement>('[data-wipe]').forEach((el) => {
      const tween = gsap.fromTo(
        el,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        },
      );
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });

    // scroll progress bar
    const bar = document.querySelector<HTMLElement>('[data-progress-bar]');
    if (bar) {
      const tween = gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true },
        },
      );
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    }

    ScrollTrigger.refresh();
    return () => {
      triggers.forEach((t) => t.kill());
      gsap.killTweensOf(nodes);
    };
  }, [reduced]);
}
