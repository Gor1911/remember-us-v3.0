'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { pages } from '@/app/lib/api';
import type { MemorialPageDetail } from '@/app/lib/types';
import {
  EMPTY_FORM, MAX_PHOTOS, MIN_BIOGRAPHY_LENGTH, PLAN_STEP, formFromPage, getDateErrors, getLifeErrors,
  type FormState, type PhotoEntry, type Step,
} from './formTypes';
import { createPayload, syncMedia, updatePayload } from './memorialSave';

export interface CreatedResult {
  submitted: boolean;
  warning: string;
}

const revoke = (p: PhotoEntry | null | undefined) => {
  if (p?.file) URL.revokeObjectURL(p.preview);
};

/** Form state, main photo + gallery handling, and the create / save flows. */
export function useMemorialForm(isAdmin: boolean) {
  const [step, setStep]                 = useState<Step>(0);
  const [form, setForm]                 = useState<FormState>(EMPTY_FORM);
  const [photos, setPhotos]             = useState<PhotoEntry[]>([]);
  /** Main photo (round portrait), uploaded separately from the gallery. */
  const [portrait, setPortraitState]    = useState<PhotoEntry | null>(null);
  /** Stored media the family removed while editing; deleted on save. */
  const [removedIds, setRemovedIds]     = useState<string[]>([]);
  const [submitting, setSubmitting]     = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [apiError, setApiError]         = useState('');
  const [created, setCreated]           = useState<CreatedResult | null>(null);
  /** Edit flow: set after a successful save (warning text, possibly empty). */
  const [saved, setSaved]               = useState<{ warning: string } | null>(null);
  /** Slug of the draft once it exists (non-admins then pick a plan). */
  const [draftSlug, setDraftSlug]       = useState<string | null>(null);
  const [draftWarning, setDraftWarning] = useState('');

  const photosRef = useRef(photos);
  const portraitRef = useRef(portrait);
  useEffect(() => { photosRef.current = photos; }, [photos]);
  useEffect(() => { portraitRef.current = portrait; }, [portrait]);
  useEffect(() => () => {
    photosRef.current.forEach(revoke);
    revoke(portraitRef.current);
  }, []);

  /** Edit flow: fill the form from the stored memorial. */
  const load = useCallback((p: MemorialPageDetail) => {
    setForm(formFromPage(p));
    const main = p.media_files.find((m) => m.is_primary_portrait) ?? null;
    setPortraitState(main ? { id: main.id, preview: main.file_url } : null);
    setPhotos(
      p.media_files
        .filter((m) => m.media_type === 'photo')
        .sort((a, b) => a.order - b.order)
        .map((m) => ({ id: m.id, preview: m.file_url })),
    );
    setRemovedIds([]);
  }, []);

  const markRemoved = useCallback((id: string | undefined) => {
    if (id) setRemovedIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
  }, []);

  const setPortrait = useCallback((file: File | null) => {
    const prev = portraitRef.current;
    revoke(prev);
    // A replaced main photo is swapped server-side on upload; a removed one must be deleted.
    if (!file) markRemoved(prev?.id);
    const next = file ? { file, preview: URL.createObjectURL(file) } : null;
    portraitRef.current = next;
    setPortraitState(next);
  }, [markRemoved]);

  const set = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
  }, []);

  const addPhotos = useCallback((files: File[]) => {
    setPhotos((prev) => {
      const next = [...prev];
      for (const file of files) {
        if (next.length >= MAX_PHOTOS) break;
        next.push({ file, preview: URL.createObjectURL(file) });
      }
      return next;
    });
  }, []);

  const removePhoto = useCallback((index: number) => {
    const gone = photosRef.current[index];
    if (!gone) return;
    revoke(gone);
    markRemoved(gone.id);
    setPhotos((prev) => prev.filter((p) => p !== gone));
  }, [markRemoved]);

  const dateErrors = getDateErrors(form);
  const lifeErrors = getLifeErrors(form);
  const bioOk = form.biography.trim().length >= MIN_BIOGRAPHY_LENGTH;
  const nameOk = !!form.first_name.trim() && !!form.last_name.trim();
  const canNext =
    step === 0 ? nameOk && Object.keys(dateErrors).length === 0
    : step === 1 ? bioOk
    : step === 2 ? Object.keys(lifeErrors).length === 0
    : true;

  /** Create flow: draft → photos → (admin) submit, or (owner) the plan step. */
  const create = useCallback(async () => {
    if (submitting || draftSlug) return;
    setSubmitting(true);
    setApiError('');
    setUploadStatus('Saving…');

    const res = await pages.create(createPayload(form));
    if (!res.success) {
      setApiError(res.error);
      setUploadStatus('');
      setSubmitting(false);
      return;
    }
    const slug = res.data.slug;
    const problems = await syncMedia({ slug, portrait, photos, removedIds: [], onStatus: setUploadStatus });
    const uploadWarning = problems.join(' ');

    if (!isAdmin) {
      // Drafts are free; paying (next step) submits for review.
      setUploadStatus('');
      setSubmitting(false);
      setDraftSlug(slug);
      setDraftWarning(uploadWarning);
      setStep(PLAN_STEP);
      return;
    }

    setUploadStatus('Sending for review…');
    const sub = await pages.submit(slug);
    const warnings = [uploadWarning];
    if (!sub.success) warnings.push(sub.error);
    setUploadStatus('');
    setSubmitting(false);
    setCreated({ submitted: sub.success, warning: warnings.filter(Boolean).join(' ') });
  }, [form, portrait, photos, isAdmin, submitting, draftSlug]);

  /** Edit flow: text and life rows in one PATCH, then photo changes. */
  const save = useCallback(async (slug: string) => {
    if (submitting) return;
    setSubmitting(true);
    setApiError('');
    setUploadStatus('Saving changes…');

    const res = await pages.update(slug, updatePayload(form));
    if (!res.success) {
      setApiError(res.error);
      setUploadStatus('');
      setSubmitting(false);
      return;
    }
    const problems = await syncMedia({ slug, portrait, photos, removedIds, onStatus: setUploadStatus });
    setUploadStatus('');
    setSubmitting(false);
    setSaved({ warning: problems.join(' ') });
  }, [form, portrait, photos, removedIds, submitting]);

  return {
    step, setStep, form, setForm, set, photos, addPhotos, removePhoto,
    portrait, setPortrait, dateErrors, lifeErrors, canNext, submitting, uploadStatus, apiError,
    created, create, saved, save, load, draftSlug, draftWarning,
  };
}
