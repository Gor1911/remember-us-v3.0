'use client';

import { useEffect, useRef } from 'react';
import { createPortal, flushSync } from 'react-dom';
import Image from 'next/image';
import { ArrowIcon, CloseIcon } from '@/components/ui/icons';
import type { GalleryPhoto } from '@/components/memorial/GalleryLightbox';
import { FOCUSABLE } from '@/components/dashboard/DialogShell';

/** Round controls floating on the dark ink viewer; white focus ring for contrast on ink. */
const VIEWER_BTN =
  'flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-linen hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

/** Horizontal distance (px) a finger must travel to change photo; vertical to close. */
const SWIPE_X = 50;
const SWIPE_CLOSE_Y = 90;
/** Duration of each half of the slide (leave, then enter). */
const SLIDE_MS = 200;

interface LightboxViewerProps {
  photos: GalleryPhoto[];
  index: number;
  onIndex: (i: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

/**
 * Full-screen photo viewer. Rendered through a portal into <body> so no animated (transformed)
 * ancestor can trap the fixed overlay inside its own box. Keyboard: ←/→/Esc. Touch: swipe
 * left/right to change photo, swipe down to close; the photo follows the finger.
 */
export function LightboxViewer({ photos, index, onIndex, onPrev, onNext, onClose }: LightboxViewerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const drag = useRef({ x: 0, y: 0 });
  const slideRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const photo = photos[index];
  const many = photos.length > 1;

  // Warm the neighbours so the photo sliding in is already decoded. Only for photos served as-is:
  // optimised ones are fetched through next/image at a different URL, so warming the original
  // would download a full-size file nobody sees.
  useEffect(() => {
    if (!many) return;
    for (const i of [index + 1, index - 1]) {
      const p = photos[(i + photos.length) % photos.length];
      if (!p.unoptimized) continue;
      const img = new window.Image();
      img.src = p.src;
    }
  }, [index, many, photos]);

  // Focus moves into the viewer and returns to the tile that opened it.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => previous?.focus();
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    if (busy.current || e.touches.length !== 1) { start.current = null; return; } // leave pinch-zoom alone
    start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  // The photo follows the finger. Written straight to the DOM (no re-render per touchmove).
  const paint = (x: number, y: number, animate: boolean) => {
    drag.current = { x, y };
    const slide = slideRef.current;
    const backdrop = backdropRef.current;
    if (slide) {
      slide.style.transition = animate ? '' : 'none';
      slide.style.transform = x || y ? `translate3d(${x}px, ${y}px, 0)` : '';
    }
    if (backdrop) backdrop.style.opacity = y ? String(1 - Math.min(y / 400, 0.5)) : '';
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!start.current) return;
    const dx = e.touches[0].clientX - start.current.x;
    const dy = e.touches[0].clientY - start.current.y;
    // Follow the dominant axis only; a downward drag previews the close gesture.
    if (Math.abs(dx) > Math.abs(dy)) paint(many ? dx : dx / 4, 0, false);
    else paint(0, Math.max(0, dy), false);
  };

  /**
   * Carousel step, like a phone's photo roll: the current photo leaves towards the swipe
   * (next → off to the left) and the new one enters from the opposite edge.
   */
  const slideTo = (dir: 1 | -1) => {
    const go = dir === 1 ? onNext : onPrev;
    const slide = slideRef.current;
    if (!slide || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      paint(0, 0, false);
      go();
      return;
    }
    busy.current = true;
    const width = window.innerWidth;
    slide.style.transition = `transform ${SLIDE_MS}ms ease-in`;
    slide.style.transform = `translate3d(${-dir * width}px, 0, 0)`;
    window.setTimeout(() => {
      flushSync(go); // swap the photo synchronously, while it is off-screen
      slide.style.transition = 'none';
      slide.style.transform = `translate3d(${dir * width}px, 0, 0)`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          slide.style.transition = `transform ${SLIDE_MS}ms ease-out`;
          slide.style.transform = '';
          drag.current = { x: 0, y: 0 };
          window.setTimeout(() => { slide.style.transition = ''; busy.current = false; }, SLIDE_MS);
        });
      });
    }, SLIDE_MS);
  };

  const onTouchEnd = () => {
    if (!start.current) return;
    const { x, y } = drag.current;
    start.current = null;
    if (many && x <= -SWIPE_X) slideTo(1);
    else if (many && x >= SWIPE_X) slideTo(-1);
    else {
      paint(0, 0, true); // not far enough — spring back
      if (y >= SWIPE_CLOSE_Y) onClose();
    }
  };

  // Keep Tab inside the viewer: the page underneath is covered and must not take focus.
  const rootRef = useRef<HTMLDivElement>(null);
  const trapTab = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !rootRef.current) return;
    const items = Array.from(rootRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Family photos"
      onKeyDown={trapTab}
      className="fixed inset-0 z-[200] flex items-center justify-center"
    >
      <div ref={backdropRef} className="absolute inset-0 bg-ink/95 backdrop-blur-sm" onClick={onClose} />

      {/* Main image — swipe surface */}
      <div
        className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-16 touch-none select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        <div ref={slideRef} className="relative w-full h-full max-w-5xl transition-transform duration-300 ease-out motion-reduce:transition-none">
          <Image key={photo.id} src={photo.src} alt={photo.alt} fill unoptimized={photo.unoptimized} sizes="100vw" className="object-contain" priority draggable={false} />
        </div>
      </div>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
        <span className="type-caption text-linen tabular-nums" aria-live="polite" aria-atomic="true">
          <span className="sr-only">Photo </span>{index + 1}<span aria-hidden="true"> / </span><span className="sr-only"> of </span>{photos.length}
          {photo.caption && <span className="sr-only">: {photo.caption}</span>}
        </span>
      </div>

      {photo.caption && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 w-full max-w-xl">
          <p className="type-body text-linen text-center px-6">{photo.caption}</p>
        </div>
      )}

      <button ref={closeRef} type="button" onClick={onClose} className={`absolute top-5 right-5 z-10 w-11 h-11 ${VIEWER_BTN}`} aria-label="Close">
        <CloseIcon />
      </button>

      {many && (
        <>
          {/* Arrows stay visible on phones too; swiping is the faster way there */}
          <button type="button" onClick={() => !busy.current && slideTo(-1)} className={`absolute left-3 md:left-6 z-10 w-11 h-11 md:w-12 md:h-12 ${VIEWER_BTN}`} aria-label="Previous photo">
            <ArrowIcon direction="left" />
          </button>
          <button type="button" onClick={() => !busy.current && slideTo(1)} className={`absolute right-3 md:right-6 z-10 w-11 h-11 md:w-12 md:h-12 ${VIEWER_BTN}`} aria-label="Next photo">
            <ArrowIcon />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2 px-4 max-w-full overflow-x-auto">
            {photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={`relative w-12 h-9 shrink-0 rounded-[8px] overflow-hidden transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  i === index ? 'ring-2 ring-white opacity-100' : 'opacity-40 hover:opacity-70'
                }`}
              >
                <Image src={p.src} alt="" fill unoptimized={p.unoptimized} sizes="48px" className="object-cover" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}
