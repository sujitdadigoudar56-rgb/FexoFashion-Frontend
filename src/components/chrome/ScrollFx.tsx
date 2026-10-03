'use client';

// Lenis smooth scroll + GSAP scroll-reveal for `.fx-reveal` / `.fx-fade-up`.
// Mounted once in the root layout; the reveal wiring re-runs on every route
// change since each page renders fresh elements.
//
// Page content hydrates after this layout-level component (it streams in
// behind the route's loading boundary), so GSAP must not touch an element
// until React has hydrated it — otherwise the inline styles GSAP writes
// show up as a hydration mismatch. Elements are wired once React owns them.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

let lenis: Lenis | null = null;

const SELECTOR = '.fx-reveal, .fx-fade-up';
const MAX_WAIT_MS = 4000;

/** React tags each DOM node it has hydrated/created with a __reactFiber$… key. */
function isHydrated(el: Element): boolean {
  return Object.keys(el).some((k) => k.startsWith('__reactFiber$'));
}

export default function ScrollFx() {
  const pathname = usePathname();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!lenis) {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      const raf = (time: number) => {
        lenis?.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {});
    const wired = new WeakSet<Element>();
    const started = performance.now();
    let frame = 0;

    const wire = () => {
      let waiting = false;
      ctx.add(() => {
        gsap.utils.toArray<HTMLElement>(SELECTOR).forEach((el) => {
          if (wired.has(el)) return;
          if (!isHydrated(el)) {
            waiting = true;
            return;
          }
          wired.add(el);
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%' },
          });
        });
        ScrollTrigger.refresh();
      });
      if (waiting && performance.now() - started < MAX_WAIT_MS) {
        frame = requestAnimationFrame(wire);
      }
    };

    wire();
    return () => {
      cancelAnimationFrame(frame);
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
