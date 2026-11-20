'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { pages, media } from '@/app/lib/api';
import type { CreatePagePayload } from '@/app/lib/types';
import {
  EMPTY_FORM, MAX_PHOTOS, MIN_BIOGRAPHY_LENGTH, getDateErrors,
  type FormState, type PhotoEntry, type Step,
} from './formTypes';

export interface CreatedResult {
  submitted: boolean;
  warning: string;
}

function uploadImage(slug: string, file: File, isPortrait: boolean) {
  const fd = new FormData();
  fd.append('file', file);
  if (isPortrait) fd.append('is_primary_portrait', 'true');
  return media.upload(slug, fd);
}

/** Form state, main photo + gallery handling and the create -> upload -> submit flow. */
export function useMemorialForm(isAdmin: boolean) {
  const [step, setStep]                 = useState<Step>(0);
  const [form, setForm]                 = useState<FormState>(EMPTY_FORM);
  const [photos, setPhotos]             = useState<PhotoEntry[]>([]);
  /** Main photo (page cover), uploaded separately from the gallery. */
  const [portrait, setPortraitState]    = useState<PhotoEntry | null>(null);
  const [submitting, setSubmitting]     = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [apiError, setApiError]         = useState('');
  const [created, setCreated]           = useState<CreatedResult | null>(null);
  /** Slug of the draft once it exists (non-admins then pick a plan). */
  const [draftSlug, setDraftSlug]       = useState<string | null>(null);
  const [draftWarning, setDraftWarning] = useState('');

  const photosRef = useRef(photos);
  const portraitRef = useRef(portrait);
  useEffect(() => { photosRef.current = photos; }, [photos]);
  useEffect(() => { portraitRef.current = portrait; }, [portrait]);
  useEffect(() => () => {
    photosRef.current.forEach((p) => URL.revokeObjectURL(p.preview));
    if (portraitRef.current) URL.revokeObjectURL(portraitRef.current.preview);
  }, []);

  const setPortrait = useCallback((file: File | null) => {
    setPortraitState((prev) => {
      if (prev) URL.revokeObjectURL(prev.preview);
      return file ? { file, preview: URL.createObjectURL(file) } : null;
    });
  }, []);

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
    setPhotos((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  }, []);

  const dateErrors = getDateErrors(form);
  const canNext =
    step === 0
      ? !!form.first_name.trim() && !!form.last_name.trim() && Object.keys(dateErrors).length === 0
    : step === 1 ? form.biography.trim().length >= MIN_BIOGRAPHY_LENGTH
    : true;

  const create = useCallback(async () => {
    if (submitting || draftSlug) return;
    setSubmitting(true);
    setApiError('');
    setUploadStatus('');

    const payload: CreatePagePayload = {
      page_type:  form.page_type,
      first_name: form.first_name.trim(),
      last_name:  form.last_name.trim(),
      biography:  form.biography.trim(),
      birth_date: form.birth_date || undefined,
      death_date: form.death_date || undefined,
    };
    if (form.page_type === 'military') {
      if (form.military_rank)   payload.military_rank   = form.military_rank.trim();
      if (form.military_branch) payload.military_branch = form.military_branch.trim();
      if (form.service_start)   payload.service_start   = form.service_start;
      if (form.service_end)     payload.service_end     = form.service_end;
    }

    const res = await pages.create(payload);
    if (!res.success) {
      setApiError(res.error);
      setSubmitting(false);
      return;
    }
    const slug = res.data.slug;

    const problems: string[] = [];
    // Main photo first, so the cover is in place even if a gallery upload fails.
    if (portrait) {
      setUploadStatus('Uploading main photo…');
      const up = await uploadImage(slug, portrait.file, true);
      if (!up.success) problems.push(`The main photo failed to upload (${up.error}).`);
    }

    let failedUploads = 0;
    for (let i = 0; i < photos.length; i++) {
      setUploadStatus(`Uploading gallery photo ${i + 1} of ${photos.length}…`);
      const up = await uploadImage(slug, photos[i].file, false);
      if (!up.success) failedUploads += 1;
    }
    if (failedUploads > 0) {
      problems.push(`${failedUploads} gallery photo${failedUploads > 1 ? 's' : ''} failed to upload.`);
    }
    if (problems.length > 0) problems.push('You can add them later by editing the memorial.');
    const uploadWarning = problems.join(' ');

    if (!isAdmin) {
      // Drafts are free; paying (next step) submits for review.
      setUploadStatus('');
      setSubmitting(false);
      setDraftSlug(slug);
      setDraftWarning(uploadWarning);
      setStep(4);
      return;
    }

    setUploadStatus('Submitting for review…');
    const sub = await pages.submit(slug);
    const warnings = [uploadWarning];
    if (!sub.success) warnings.push(sub.error);
    setUploadStatus('');
    setSubmitting(false);
    setCreated({ submitted: sub.success, warning: warnings.filter(Boolean).join(' ') });
  }, [form, portrait, photos, isAdmin, submitting, draftSlug]);

  return {
    step, setStep, form, set, photos, addPhotos, removePhoto,
    portrait, setPortrait, dateErrors, canNext, submitting, uploadStatus, apiError, created, create, draftSlug, draftWarning,
  };
}
