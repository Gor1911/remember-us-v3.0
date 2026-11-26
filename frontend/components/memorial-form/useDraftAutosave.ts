'use client';

import { useEffect, useRef, useState } from 'react';
import { EMPTY_FORM, type FormState } from './formTypes';

const KEY = 'remember-us:memorial-draft:v1';
/** Older unsaved text is not worth restoring (and may belong to a finished memorial). */
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

interface Stored {
  form: FormState;
  savedAt: number;
}

function read(): Stored | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed?.form || Date.now() - parsed.savedAt > MAX_AGE_MS) return null;
    return { form: { ...EMPTY_FORM, ...parsed.form }, savedAt: parsed.savedAt };
  } catch {
    return null;
  }
}

const isEmpty = (f: FormState) =>
  !f.first_name.trim() && !f.last_name.trim() && !f.biography.trim() && f.timeline.length === 0 && f.awards.length === 0;

/**
 * Keeps the unsent text of a new memorial in this browser, so a refresh, a closed tab or a phone
 * call does not lose a half-written story. Photos cannot be kept (files don't survive a reload).
 */
export function useDraftAutosave(form: FormState, restore: (f: FormState) => void, enabled: boolean) {
  const [restoredAt, setRestoredAt] = useState<number | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const ready = useRef(false);

  // Restore once, on mount.
  useEffect(() => {
    if (!enabled) return;
    const stored = read();
    if (stored && !isEmpty(stored.form)) {
      restore(stored.form);
      setRestoredAt(stored.savedAt);
    }
    ready.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Save, debounced.
  useEffect(() => {
    if (!enabled || !ready.current) return;
    const t = window.setTimeout(() => {
      try {
        if (isEmpty(form)) {
          window.localStorage.removeItem(KEY);
        } else {
          const now = Date.now();
          window.localStorage.setItem(KEY, JSON.stringify({ form, savedAt: now } satisfies Stored));
          setSavedAt(now);
        }
      } catch {
        // Storage full or blocked (private mode): the form still works, it just isn't kept.
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [form, enabled]);

  const clear = () => {
    try { window.localStorage.removeItem(KEY); } catch { /* nothing to clear */ }
    setRestoredAt(null);
  };

  return { restoredAt, savedAt, clear, dismissRestored: () => setRestoredAt(null) };
}
