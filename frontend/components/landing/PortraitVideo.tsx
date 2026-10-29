'use client';

import { LivingPortraitPlayer } from '@/components/memorial/LivingPortraitPlayer';

interface PortraitVideoProps {
  className?: string;
}

/** Landing demo of the living portrait. Must be rendered inside a positioned, fixed-size container. */
export function PortraitVideo({ className = '' }: PortraitVideoProps) {
  return (
    <LivingPortraitPlayer
      src="/images/veteran-portrait.webm"
      altSrc="/images/veteran-portrait.mp4"
      poster="/images/veteran-portrait-poster.jpg"
      label="Animated portrait of a veteran (AI-generated demo)"
      className={className}
    />
  );
}
