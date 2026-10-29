'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface PortraitVideoProps {
  className?: string;
}

const POSTER = '/images/veteran-portrait-poster.jpg';

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
    <rect x="6" y="5" width="4" height="14" rx="1.2" />
    <rect x="14" y="5" width="4" height="14" rx="1.2" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
    <path d="M8 5.6c0-.9 1-1.4 1.7-.9l9 6.4c.6.4.6 1.4 0 1.8l-9 6.4c-.7.5-1.7 0-1.7-.9V5.6Z" />
  </svg>
);

/**
 * Loops the living portrait while it is on screen (WCAG 2.2.2: includes a
 * pause/play control). Must be rendered inside a positioned container with a
 * fixed size. Honors prefers-reduced-motion (poster only) and falls back to
 * the poster if the video fails to load.
 */
export function PortraitVideo({ className = '' }: PortraitVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          if (!userPaused.current) video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.play().catch(() => {});
    } else {
      userPaused.current = true;
      video.pause();
    }
  }, []);

  const label = playing ? 'Pause animation' : 'Play animation';

  return (
    <>
      <Image src={POSTER} alt="" fill sizes="288px" aria-hidden="true" className={className} />
      {!failed && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          poster={POSTER}
          aria-label="Animated portrait of a veteran (AI-generated demo)"
          className={`${className} motion-reduce:hidden`}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
        >
          <source src="/images/veteran-portrait.webm" type="video/webm" />
          <source src="/images/veteran-portrait.mp4" type="video/mp4" onError={() => setFailed(true)} />
        </video>
      )}
      {!failed && (
        <button
          type="button"
          onClick={toggle}
          aria-label={label}
          aria-pressed={!playing}
          className="absolute bottom-3 left-3 z-10 flex motion-reduce:hidden h-11 w-11 items-center justify-center rounded-full border border-[#1A1614]/15 bg-white/90 text-[#1A1614] backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
      )}
    </>
  );
}
