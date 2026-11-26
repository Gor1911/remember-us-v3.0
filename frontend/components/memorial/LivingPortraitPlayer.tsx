'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { SparkIcon } from '@/components/ui/icons';
import { FOCUS } from '@/components/ui/styles';

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
  /** Position classes for the pause/play control (default: bottom-left corner). */
  controlClassName?: string;
  /** `sizes` hint for the poster image. */
  sizes?: string;
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
  controlClassName = 'bottom-3 left-3', sizes = '288px',
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
        <Image src={poster} alt="" fill sizes={sizes} aria-hidden="true" unoptimized={unoptimized} className={className} />
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
          className={`absolute ${controlClassName} z-10 flex motion-reduce:hidden h-11 w-11 items-center justify-center rounded-full bg-white/90 text-ink backdrop-blur-sm shadow-control transition-colors hover:bg-white ${FOCUS}`}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
      )}
      {badge && !failed && (
        <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/90 pl-2 pr-3 py-1 type-utility font-medium text-ink whitespace-nowrap backdrop-blur-sm shadow-control motion-reduce:hidden">
          <SparkIcon className="w-3.5 h-3.5 text-bronze" />
          {badge}
        </span>
      )}
    </>
  );
}
