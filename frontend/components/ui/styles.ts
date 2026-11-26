/**
 * Shared class strings for app UI (forms, dialogs, cards, actions) in the warm stone system.
 * Prefer these over hand-written classes so every page stays consistent.
 */

export const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-deep';
/** Focus ring on the dark ink surface (footer, Premium card): bronze is only 2.5:1 there, linen is 9.6:1. */
export const FOCUS_ON_DARK =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-linen';

const DISABLED = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50';

/* ── Actions (capsules, 42px) ─────────────────────────────────────────── */
export const BTN_PRIMARY = `pill pill-dark gap-2 ${DISABLED}`;
export const BTN_SECONDARY = `pill pill-soft gap-2 ${DISABLED}`;
/** White capsule — on dark (ink) surfaces only. */
export const BTN_LIGHT = `pill pill-light gap-2 ${DISABLED}`;
export const BTN_DANGER = `pill gap-2 bg-white text-danger inset-ring-[1.5px] inset-ring-danger/45 ${DISABLED}`;
/** Full-width primary submit for forms. */
export const BTN_SUBMIT = `pill pill-dark w-full h-12 ${DISABLED}`;
/**
 * Compact capsule for dense rows (tables, admin tools) — add a tone class.
 * 44px tall on touch-sized screens, 32px from md where a pointer is likely.
 */
export const BTN_SM =
  `inline-flex items-center justify-center gap-1.5 h-11 md:h-8 px-4 md:px-3.5 rounded-full font-display font-medium text-[14px] md:text-[13px] transition-opacity hover:opacity-85 active:opacity-75 ${DISABLED} ${FOCUS}`;
export const BTN_SM_DARK = `${BTN_SM} bg-ink text-white`;
export const BTN_SM_SOFT = `${BTN_SM} bg-ink/[0.07] text-ink`;
export const BTN_SM_DANGER = `${BTN_SM} bg-danger/[0.08] text-danger`;
/** Quiet text link. */
export const LINK = `text-bronze-deep underline underline-offset-4 decoration-bronze-deep/40 hover:decoration-bronze-deep rounded-sm ${FOCUS}`;

/* ── Fields ───────────────────────────────────────────────────────────── */
export const FIELD =
  'w-full bg-white border border-ink/50 rounded-[14px] px-4 py-3 text-ink type-body placeholder:text-muted outline-none transition-colors hover:border-ink/70 focus:border-bronze-deep focus-visible:ring-2 focus-visible:ring-bronze-deep/25 disabled:bg-soft disabled:text-muted';
export const LABEL = 'type-caption font-medium text-ink';
export const HINT = 'type-caption text-muted';
export const ERROR_TEXT = 'type-caption text-danger';

/* ── Surfaces ─────────────────────────────────────────────────────────── */
/** White card on canvas/sand. */
export const CARD = 'bg-white rounded-tile p-6';
/** Soft tile on canvas. */
export const TILE = 'bg-soft rounded-tile p-6';
/** Notice / inline banner. Add a tone: NOTICE_INFO, NOTICE_SUCCESS, NOTICE_WARN, NOTICE_ERROR. */
export const NOTICE = 'rounded-[16px] px-5 py-4 type-caption';
export const NOTICE_INFO = `${NOTICE} bg-sand text-ink`;
export const NOTICE_SUCCESS = `${NOTICE} bg-sage/10 text-sage`;
export const NOTICE_WARN = `${NOTICE} bg-amber-deep/10 text-amber-deep`;
export const NOTICE_ERROR = `${NOTICE} bg-danger/[0.08] text-danger`;

/* ── Swipe rows (phones) ──────────────────────────────────────────────── */
/**
 * A list that is a horizontal, snapping swipe row on phones and a normal grid from md.
 * Bleeds to the screen edges inside `content-1000` (16px gutter). Add `md:grid-cols-*` and gaps.
 */
export const SWIPE_ROW =
  'flex items-start md:items-stretch md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none scroll-px-4 -mx-4 px-4 md:mx-0 md:px-0 pb-2 md:pb-0 scrollbar-none overscroll-x-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bronze-deep';
/** One tile in a SWIPE_ROW: ~82% wide on phones so the next tile peeks in. */
export const SWIPE_ITEM = 'snap-start shrink-0 w-[82%] sm:w-[58%] md:w-auto';

/* ── Page scaffolding ─────────────────────────────────────────────────── */
/** App page background below the fixed 64px header. */
export const PAGE = 'min-h-screen bg-canvas text-ink pt-24 pb-20';
/** Narrow column for forms and auth. */
export const NARROW = 'w-[min(100%-32px,560px)] mx-auto';
export const EYEBROW = 'type-caption font-medium text-bronze-deep';
