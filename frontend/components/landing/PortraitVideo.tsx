'use client';

import { useEffect, useRef } from 'react';

interface PortraitVideoProps {
  className?: string;
}

/** Loops the living portrait while it is on screen; pauses when scrolled away. */
export function PortraitVideo({ className = '' }: PortraitVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="metadata"
      poster="/images/veteran-portrait-poster.jpg"
      aria-label="Animated portrait of a veteran"
      className={className}
    >
      <source src="/images/veteran-portrait.webm" type="video/webm" />
      <source src="/images/veteran-portrait.mp4" type="video/mp4" />
    </video>
  );
}
