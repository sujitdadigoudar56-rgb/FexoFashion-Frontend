'use client';

// Ports the Lenis smooth-scroll + GSAP ScrollTrigger reveal wiring from
// fexo.js. Mounted once in the root layout; the reveal wiring re-runs on
// every route change since each page renders fresh `.fx-reveal` /
// `.fx-fade-up` elements.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

let lenis: Lenis | null = null;

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
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.fx-reveal, .fx-fade-up').forEach((el) => {
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
    return () => ctx.revert();
  }, [pathname]);

  return null;
}
