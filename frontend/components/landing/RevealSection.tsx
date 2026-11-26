'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { useReveal } from '@/components/landing/useReveal';

interface RevealSectionProps extends ComponentPropsWithoutRef<'section'> {
  /** ScrollTrigger start, e.g. "top 85%". */
  start?: string;
}

/**
 * A <section> that fades up its `[data-reveal]` children on scroll. The only client code a
 * landing chapter needs, so the chapter itself can stay a server component.
 */
export function RevealSection({ start, children, ...props }: RevealSectionProps) {
  const ref = useReveal<HTMLElement>(start);
  return <section ref={ref} {...props}>{children}</section>;
}
