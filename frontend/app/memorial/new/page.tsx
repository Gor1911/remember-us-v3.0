'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { pages, media } from '@/app/lib/api';
import type { PageType, CreatePagePayload } from '@/app/lib/types';

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = ['Basic Info', 'Story', 'Photos', 'Review'] as const;
type Step = 0 | 1 | 2 | 3;

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  page_type: PageType;
  first_name: string;
  last_name: string;
  birth_date: string;
  death_date: string;
  biography: string;
  military_rank: string;
  military_branch: string;
  service_start: string;
  service_end: string;
}

const EMPTY: FormState = {
  page_type: 'civilian',
  first_name: '',
  last_name: '',
  birth_date: '',
  death_date: '',
  biography: '',
  military_rank: '',
  military_branch: '',
  service_start: '',
  service_end: '',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/40 text-[11px] uppercase tracking-widest font-medium">{label}</label>
      {children}
      {hint && <p className="text-white/20 text-xs">{hint}</p>}
    </div>
  );
}

function Input({ type = 'text', value, onChange, placeholder, required }: {
  type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean;
}) {
  return (
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} required={required}
      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[12px] px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
    />
  );
}

function StepProgress({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2 mb-10 flex-wrap">
      {STEPS.map((label, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium transition-all duration-300 ${
                done ? 'bg-[#8B0000] text-white' :
                current ? 'bg-[#8B0000]/20 border border-[#8B0000] text-[#8B0000]' :
                'bg-white/[0.04] border border-white/[0.08] text-white/20'
              }`}>
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${
                current ? 'text-white' : done ? 'text-white/50' : 'text-white/20'
              }`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-6 md:w-12 transition-all duration-300 ${done ? 'bg-[#8B0000]/50' : 'bg-white/[0.08]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Photo upload step ────────────────────────────────────────────────────────

interface PhotoEntry {
  file: File;
  preview: string;
}

function PhotoStep({
  photos, onAdd, onRemove,
}: {
  photos: PhotoEntry[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) => f.type.startsWith('image/'));
    onAdd(valid);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed cursor-pointer transition-all duration-200 py-12 px-6 text-center
          ${dragging
            ? 'border-[#8B0000] bg-[#8B0000]/10'
            : 'border-white/[0.10] hover:border-white/25 bg-white/[0.02] hover:bg-white/[0.04]'
          }`}
      >
        <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center text-2xl select-none">
          📷
        </div>
        <div>
          <p className="text-white/70 text-sm font-medium">Drop photos here or click to browse</p>
          <p className="text-white/25 text-xs mt-1">JPG, PNG, WEBP — up to 10 files</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Preview grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((p, i) => (
            <div key={i} className="relative group rounded-[16px] overflow-hidden aspect-square bg-white/[0.04]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.preview} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#8B0000]/80 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#8B0000]"
              >
                ×
              </button>
              {i === 0 && (
                <span className="absolute bottom-2 left-2 text-[10px] text-white/60 bg-black/50 px-2 py-0.5 rounded-full">
                  Cover
                </span>
              )}
            </div>
          ))}

          {/* Add more */}
          {photos.length < 10 && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-[16px] aspect-square border-2 border-dashed border-white/[0.10] hover:border-white/25 flex items-center justify-center text-white/30 hover:text-white/60 transition-all duration-200 text-2xl"
            >
              +
            </button>
          )}
        </div>
      )}

      <p className="text-white/20 text-xs text-center">
        Photos will be uploaded after the memorial is created. First photo becomes the cover.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewMemorialPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [step, setStep]                 = useState<Step>(0);
  const [form, setForm]                 = useState<FormState>(EMPTY);
  const [photos, setPhotos]             = useState<PhotoEntry[]>([]);
  const [submitting, setSubmitting]     = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [apiError, setApiError]         = useState('');
  const [createdSlug, setCreatedSlug]   = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/');
  }, [loading, isAuthenticated, router]);

  const set = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
  }, []);

  const isMilitary = form.page_type === 'military';

  const addPhotos = useCallback((files: File[]) => {
    setPhotos((prev) => {
      const next = [...prev];
      for (const file of files) {
        if (next.length >= 10) break;
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

  // Cleanup previews on unmount
  useEffect(() => {
    return () => { photos.forEach((p) => URL.revokeObjectURL(p.preview)); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canNext = useCallback(() => {
    if (step === 0) return form.first_name.trim() && form.last_name.trim();
    if (step === 1) return form.biography.trim().length >= 20;
    return true;
  }, [step, form]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleCreate = useCallback(async () => {
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

    if (isMilitary) {
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

    // Upload photos one by one
    if (photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        setUploadStatus(`Uploading photo ${i + 1} of ${photos.length}…`);
        const fd = new FormData();
        fd.append('file', photos[i].file);
        fd.append('media_type', 'photo');
        await media.upload(slug, fd);
      }
    }

    setUploadStatus('');
    setSubmitting(false);
    setCreatedSlug(slug);
    setStep(3);
  }, [form, isMilitary, photos]);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <span className="text-white/30 text-sm">Loading…</span>
      </div>
    );
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (step === 3 && createdSlug) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] text-white flex items-center justify-center p-4">
        <div className="glass rounded-[32px] p-10 max-w-md w-full flex flex-col items-center gap-6 text-center">
          <div className="w-14 h-14 rounded-full bg-[#8B0000]/20 border border-[#8B0000]/40 flex items-center justify-center text-2xl">
            ✓
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000] animate-pulse" />
            <span className="uppercase text-[#9BA4B5] text-[11px] tracking-[0.12em] font-medium">
              Memorial Created
            </span>
          </div>
          <h1 className="text-white font-bold text-2xl tracking-tight">
            {form.first_name} {form.last_name}
          </h1>
          {photos.length > 0 && (
            <p className="text-white/40 text-sm">{photos.length} photo{photos.length > 1 ? 's' : ''} uploaded</p>
          )}
          <p className="text-white/40 text-sm leading-relaxed">
            Your memorial has been submitted for review. It will be published within 24 hours after approval.
          </p>
          <div className="w-full flex flex-col gap-3">
            <Link
              href={`/${createdSlug}`}
              className="block w-full py-3.5 bg-[#8B0000] hover:bg-[#A00000] text-white font-medium text-sm rounded-[14px] transition-colors text-center no-underline"
            >
              View Memorial →
            </Link>
            <Link
              href="/"
              className="block w-full py-3.5 glass text-white/60 hover:text-white font-medium text-sm rounded-[14px] transition-colors text-center no-underline"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <div className="site-container py-12 md:py-20 max-w-2xl mx-auto">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/30 hover:text-white text-sm transition-colors no-underline mb-10"
        >
          ← Back
        </Link>

        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000] animate-pulse" />
          <span className="uppercase text-[#9BA4B5] text-[11px] tracking-[0.12em] font-medium">New Memorial</span>
        </div>
        <h1 className="text-white font-bold text-3xl md:text-4xl tracking-tight mb-8">Create Memorial</h1>

        <StepProgress step={step} />

        {/* ── Step 0: Basic Info ─────────────────────────────────────────── */}
        {step === 0 && (
          <div className="glass rounded-[32px] p-6 md:p-10 flex flex-col gap-6">
            <Field label="Memorial Type">
              <div className="flex gap-2">
                {(['civilian', 'military'] as PageType[]).map((t) => (
                  <button key={t} type="button" onClick={() => set('page_type', t)}
                    className={`flex-1 py-3 text-sm font-medium rounded-[12px] border transition-all duration-200 capitalize ${
                      form.page_type === t
                        ? 'bg-[#8B0000] border-[#8B0000] text-white'
                        : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70'
                    }`}
                  >
                    {t === 'military' ? '⭐ Military' : '🕊 Civilian'}
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name">
                <Input value={form.first_name} onChange={(v) => set('first_name', v)} placeholder="William" required />
              </Field>
              <Field label="Last Name">
                <Input value={form.last_name} onChange={(v) => set('last_name', v)} placeholder="Davis" required />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Date of Birth" hint="Optional">
                <Input type="date" value={form.birth_date} onChange={(v) => set('birth_date', v)} />
              </Field>
              <Field label="Date of Passing" hint="Optional">
                <Input type="date" value={form.death_date} onChange={(v) => set('death_date', v)} />
              </Field>
            </div>

            {isMilitary && (
              <>
                <div className="h-px bg-white/[0.06]" />
                <div className="flex items-center gap-2 -mb-2">
                  <span className="w-1 h-1 rounded-full bg-[#8B0000]" />
                  <span className="text-[#9BA4B5] text-[11px] uppercase tracking-wider font-medium">Military Service</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Rank" hint="Optional">
                    <Input value={form.military_rank} onChange={(v) => set('military_rank', v)} placeholder="Chief Master Sergeant" />
                  </Field>
                  <Field label="Branch" hint="Optional">
                    <Input value={form.military_branch} onChange={(v) => set('military_branch', v)} placeholder="U.S. Air Force" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Service Start" hint="Optional">
                    <Input type="date" value={form.service_start} onChange={(v) => set('service_start', v)} />
                  </Field>
                  <Field label="Service End" hint="Optional">
                    <Input type="date" value={form.service_end} onChange={(v) => set('service_end', v)} />
                  </Field>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Step 1: Story ──────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="glass rounded-[32px] p-6 md:p-10 flex flex-col gap-6">
            <Field label="Biography" hint="Minimum 20 characters. Tell the story of their life.">
              <textarea
                value={form.biography} onChange={(e) => set('biography', e.target.value)}
                placeholder="Write a biography here…" rows={12}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[12px] px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none focus:border-white/20 transition-colors resize-none leading-relaxed"
              />
            </Field>
            <div className="flex justify-end">
              <span className={`text-xs ${form.biography.length < 20 ? 'text-white/20' : 'text-[#8B0000]/70'}`}>
                {form.biography.length} chars
              </span>
            </div>
          </div>
        )}

        {/* ── Step 2: Photos ─────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="glass rounded-[32px] p-6 md:p-10">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-1 h-1 rounded-full bg-[#8B0000]" />
              <span className="text-[#9BA4B5] text-[11px] uppercase tracking-wider font-medium">
                {photos.length > 0 ? `${photos.length} photo${photos.length > 1 ? 's' : ''} selected` : 'Add Photos'}
              </span>
            </div>
            <PhotoStep photos={photos} onAdd={addPhotos} onRemove={removePhoto} />
          </div>
        )}

        {/* ── Step 3: Review ─────────────────────────────────────────────── */}
        {step === 3 && !createdSlug && (
          <div className="glass rounded-[32px] p-6 md:p-10 flex flex-col gap-6">
            <ReviewRow label="Type"   value={form.page_type === 'military' ? '⭐ Military' : '🕊 Civilian'} />
            <ReviewRow label="Name"   value={`${form.first_name} ${form.last_name}`} />
            {form.birth_date && <ReviewRow label="Born"   value={form.birth_date} />}
            {form.death_date && <ReviewRow label="Passed" value={form.death_date} />}
            {isMilitary && form.military_rank   && <ReviewRow label="Rank"    value={form.military_rank} />}
            {isMilitary && form.military_branch && <ReviewRow label="Branch"  value={form.military_branch} />}
            {isMilitary && form.service_start   && <ReviewRow label="Service" value={`${form.service_start} — ${form.service_end || 'present'}`} />}
            {photos.length > 0 && <ReviewRow label="Photos" value={`${photos.length} selected`} />}
            {form.biography && (
              <div className="flex flex-col gap-1.5">
                <span className="text-white/30 text-[11px] uppercase tracking-widest">Biography</span>
                <p className="text-white/60 text-sm leading-relaxed line-clamp-4">{form.biography}</p>
              </div>
            )}
            {/* Photo previews in review */}
            {photos.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {photos.slice(0, 4).map((p, i) => (
                  <div key={i} className="rounded-[10px] overflow-hidden aspect-square bg-white/[0.04]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.preview} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {photos.length > 4 && (
                  <div className="rounded-[10px] aspect-square bg-white/[0.06] flex items-center justify-center">
                    <span className="text-white/40 text-xs">+{photos.length - 4}</span>
                  </div>
                )}
              </div>
            )}
            {apiError && <p className="text-[#8B0000] text-sm text-center">{apiError}</p>}
            {uploadStatus && (
              <div className="flex items-center gap-2 justify-center">
                <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-white/50 text-sm">{uploadStatus}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Navigation ─────────────────────────────────────────────────── */}
        <div className="flex justify-between mt-6 gap-3">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
            disabled={step === 0 || submitting}
            className="px-6 py-3 glass text-white/50 hover:text-white disabled:opacity-0 disabled:pointer-events-none text-sm font-medium rounded-[14px] transition-all"
          >
            ← Back
          </button>

          {step < 3 && !createdSlug && (
            <button
              onClick={() => {
                if (step < 2) { if (canNext()) setStep((s) => (s + 1) as Step); }
                else setStep(3);
              }}
              disabled={step < 2 && !canNext()}
              className="px-8 py-3 bg-[#8B0000] hover:bg-[#A00000] disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium rounded-[14px] transition-all"
            >
              {step === 2 ? (photos.length > 0 ? `Continue with ${photos.length} photo${photos.length > 1 ? 's' : ''}` : 'Skip Photos') : 'Continue →'}
            </button>
          )}

          {step === 3 && !createdSlug && (
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="px-8 py-3 bg-[#8B0000] hover:bg-[#A00000] disabled:opacity-50 text-white text-sm font-medium rounded-[14px] transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                  {uploadStatus || 'Creating…'}
                </>
              ) : 'Create Memorial →'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-white/30 text-[11px] uppercase tracking-widest shrink-0">{label}</span>
      <span className="text-white/80 text-sm text-right">{value}</span>
    </div>
  );
}
