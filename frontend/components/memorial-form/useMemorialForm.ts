'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { pages, media } from '@/app/lib/api';
import type { CreatePagePayload } from '@/app/lib/types';
import { EMPTY_FORM, MAX_PHOTOS, type FormState, type PhotoEntry, type Step } from './formTypes';

export interface CreatedResult {
  submitted: boolean;
  warning: string;
}

/** Form state, photo handling and the create -> upload -> submit flow. */
export function useMemorialForm(isAdmin: boolean) {
  const [step, setStep]                 = useState<Step>(0);
  const [form, setForm]                 = useState<FormState>(EMPTY_FORM);
  const [photos, setPhotos]             = useState<PhotoEntry[]>([]);
  const [submitting, setSubmitting]     = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [apiError, setApiError]         = useState('');
  const [created, setCreated]           = useState<CreatedResult | null>(null);
  /** Slug of the draft once it exists (non-admins then pick a plan). */
  const [draftSlug, setDraftSlug]       = useState<string | null>(null);
  const [draftWarning, setDraftWarning] = useState('');

  const photosRef = useRef(photos);
  useEffect(() => { photosRef.current = photos; }, [photos]);
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.preview)), []);

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

  const canNext =
    step === 0 ? !!form.first_name.trim() && !!form.last_name.trim()
    : step === 1 ? form.biography.trim().length >= 20
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
      biography:  form.biography.trim() || undefined,
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

    let failedUploads = 0;
    for (let i = 0; i < photos.length; i++) {
      setUploadStatus(`Uploading photo ${i + 1} of ${photos.length}…`);
      const fd = new FormData();
      fd.append('file', photos[i].file);
      fd.append('media_type', 'photo');
      const up = await media.upload(slug, fd);
      if (!up.success) failedUploads += 1;
    }

    const uploadWarning = failedUploads > 0
      ? `${failedUploads} photo${failedUploads > 1 ? 's' : ''} failed to upload. You can add them later by editing the memorial.`
      : '';

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
  }, [form, photos, isAdmin, submitting, draftSlug]);

  return {
    step, setStep, form, set, photos, addPhotos, removePhoto,
    canNext, submitting, uploadStatus, apiError, created, create, draftSlug, draftWarning,
  };
}
