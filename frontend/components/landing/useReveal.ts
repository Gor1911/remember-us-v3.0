'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Fades up every `[data-reveal]` element inside the returned ref once the
 * section scrolls into view (y 40 → 0, 0.8s, power2.out, 0.1s stagger).
 */
export function useReveal<T extends HTMLElement>(start = 'top 80%') {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from(root.querySelectorAll('[data-reveal]'), {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.1,
        // Remove the inline transform afterwards: a transformed ancestor traps `position: fixed`
        // children (e.g. the photo viewer) inside its own box.
        clearProps: 'transform',
        scrollTrigger: { trigger: root, start, once: true },
      });
    }, root);
    return () => ctx.revert();
  }, [start]);

  return ref;
}
