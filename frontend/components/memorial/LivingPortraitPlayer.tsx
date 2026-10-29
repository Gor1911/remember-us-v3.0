'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface LivingPortraitPlayerProps {
  /** Primary video source (webm or mp4). */
  src: string;
  /** Optional second source, e.g. an mp4 fallback for a webm primary. */
  altSrc?: string;
  /** Still image shown as poster, for reduced motion and on error. */
  poster: string | null;
  /** Accessible description of the video. */
  label: string;
  /** Small visible caption, e.g. "AI Living Portrait". */
  badge?: string;
  /** Classes applied to the media elements (object-fit etc.). */
  className?: string;
  /** Skip Next image optimisation (signed / remote URLs). */
  unoptimized?: boolean;
}

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

const mimeFor = (url: string): string => {
  const path = url.split('?')[0].toLowerCase();
  return path.endsWith('.webm') ? 'video/webm' : 'video/mp4';
};

/**
 * Loops a living portrait while on screen (WCAG 2.2.2: pause/play control).
 * Render inside a positioned container with a fixed size. Honors
 * prefers-reduced-motion (poster only) and falls back to the poster on error.
 */
export function LivingPortraitPlayer({
  src, altSrc, poster, label, badge, className = 'object-cover object-center', unoptimized = false,
}: LivingPortraitPlayerProps) {
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

  return (
    <>
      {poster && (
        <Image src={poster} alt="" fill sizes="288px" aria-hidden="true" unoptimized={unoptimized} className={className} />
      )}
      {!failed && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster ?? undefined}
          aria-label={label}
          className={`${className} absolute inset-0 h-full w-full motion-reduce:hidden`}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
        >
          <source src={src} type={mimeFor(src)} onError={altSrc ? undefined : () => setFailed(true)} />
          {altSrc && <source src={altSrc} type={mimeFor(altSrc)} onError={() => setFailed(true)} />}
        </video>
      )}
      {!failed && (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause animation' : 'Play animation'}
          aria-pressed={!playing}
          className="absolute bottom-3 left-3 z-10 flex motion-reduce:hidden h-11 w-11 items-center justify-center rounded-full border border-[#1A1614]/15 bg-white/90 text-[#1A1614] backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
      )}
      {badge && !failed && (
        <span className="absolute top-3 right-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[#1A1614] backdrop-blur-sm motion-reduce:hidden">
          {badge}
        </span>
      )}
    </>
  );
}
