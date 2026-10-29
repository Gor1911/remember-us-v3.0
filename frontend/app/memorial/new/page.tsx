'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/dashboard/Icons';
import { BasicInfoStep } from '@/components/memorial-form/BasicInfoStep';
import { Field, Textarea } from '@/components/memorial-form/FormFields';
import { PhotoStep } from '@/components/memorial-form/PhotoStep';
import { ReviewStep } from '@/components/memorial-form/ReviewStep';
import { StepProgress } from '@/components/memorial-form/StepProgress';
import { SuccessScreen } from '@/components/memorial-form/SuccessScreen';
import { useMemorialForm } from '@/components/memorial-form/useMemorialForm';
import type { Step } from '@/components/memorial-form/formTypes';

const PRIMARY =
  'inline-flex items-center gap-2 whitespace-nowrap px-8 py-3 bg-[#8B0000] hover:bg-[#A00000] text-white text-sm font-medium rounded-[14px] transition-colors disabled:bg-[#1A1614]/10 disabled:text-[#8A7F74] disabled:cursor-not-allowed';

export default function NewMemorialPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const f = useMemorialForm();
  const { step, setStep, form, photos } = f;

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/');
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <span className="text-[#6B6560] text-sm">Loading…</span>
      </div>
    );
  }

  if (f.created) {
    return (
      <SuccessScreen
        name={`${form.first_name} ${form.last_name}`}
        photoCount={photos.length}
        submitted={f.created.submitted}
        warning={f.created.warning}
      />
    );
  }

  const plural = photos.length > 1 ? 's' : '';
  const nextLabel = step === 2
    ? (photos.length > 0 ? `Continue with ${photos.length} photo${plural}` : 'Skip Photos')
    : 'Continue';

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1614]">
      <div className="site-container py-12 md:py-20 max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#6B6560] hover:text-[#1A1614] text-sm transition-colors no-underline mb-10"
        >
          <ArrowLeftIcon /> Dashboard
        </Link>

        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
          <span className="uppercase text-[#6B6560] text-[11px] tracking-[0.12em] font-medium">New Memorial</span>
        </div>
        <h1 className="text-[#1A1614] font-bold text-3xl md:text-4xl tracking-tight mb-8">Create Memorial</h1>

        <StepProgress step={step} />

        {step === 0 && <BasicInfoStep form={form} onChange={f.set} />}

        {step === 1 && (
          <div className="glass rounded-[32px] p-6 md:p-10 flex flex-col gap-4">
            <Field label="Biography" htmlFor="biography" hint="Minimum 20 characters. Tell the story of their life.">
              <Textarea
                id="biography" value={form.biography} placeholder="Write a biography here…"
                onChange={(v) => f.set('biography', v)}
              />
            </Field>
            <span className={`self-end text-xs ${form.biography.trim().length < 20 ? 'text-[#6B6560]' : 'text-[#8B0000]'}`}>
              {form.biography.length} chars
            </span>
          </div>
        )}

        {step === 2 && (
          <div className="glass rounded-[32px] p-6 md:p-10">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-1 h-1 rounded-full bg-[#8B0000]" />
              <span className="text-[#6B6560] text-[11px] uppercase tracking-wider font-medium">
                {photos.length > 0 ? `${photos.length} photo${plural} selected` : 'Add Photos'}
              </span>
            </div>
            <PhotoStep photos={photos} onAdd={f.addPhotos} onRemove={f.removePhoto} />
          </div>
        )}

        {step === 3 && (
          <ReviewStep form={form} photos={photos} apiError={f.apiError} uploadStatus={f.uploadStatus} />
        )}

        <div className="flex justify-between mt-6 gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
            disabled={step === 0 || f.submitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-[#1A1614]/10 text-[#1A1614] hover:bg-[#F3F0EB] disabled:opacity-0 disabled:pointer-events-none text-sm font-medium rounded-[14px] transition-colors"
          >
            <ArrowLeftIcon /> Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={!f.canNext}
              className={PRIMARY}
            >
              {nextLabel} <ArrowRightIcon />
            </button>
          ) : (
            <button type="button" onClick={f.create} disabled={f.submitting} className={PRIMARY}>
              {f.submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin" />
                  {f.uploadStatus || 'Creating…'}
                </>
              ) : (
                <>Submit for review <ArrowRightIcon /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
