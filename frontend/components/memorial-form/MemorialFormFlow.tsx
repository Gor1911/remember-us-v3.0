'use client';

import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { ArrowIcon } from '@/components/ui/icons';
import { BTN_PRIMARY, BTN_SECONDARY, CARD } from '@/components/ui/styles';
import { BasicInfoStep } from './BasicInfoStep';
import { formToView } from './formToView';
import { LifeStep } from './LifeStep';
import { PhotoStep } from './PhotoStep';
import { PlanStep } from './PlanStep';
import { PreviewStep } from './PreviewStep';
import { StepProgress } from './StepProgress';
import { StoryStep } from './StoryStep';
import { EDIT_STEPS, PREVIEW_STEP, STEPS, type Step } from './formTypes';
import type { useMemorialForm } from './useMemorialForm';

type FormApi = ReturnType<typeof useMemorialForm>;

interface MemorialFormFlowProps {
  f: FormApi;
  mode: 'create' | 'edit';
  isAdmin: boolean;
  /** Edit flow: the memorial being edited. */
  slug?: string;
  /** Shown above the preview (what saving will do). */
  previewNotice?: ReactNode;
}

export const MemorialFormFlow = ({ f, mode, isAdmin, slug, previewNotice }: MemorialFormFlowProps) => {
  const { step, setStep, form, photos, portrait } = f;
  const editing = mode === 'edit';
  const steps = editing ? EDIT_STEPS : STEPS;
  const stepRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Move focus to the new step so keyboard and screen-reader users start at its top.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    stepRef.current?.focus({ preventScroll: true });
    stepRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
  }, [step]);

  const view = useMemo(
    () => (step === PREVIEW_STEP ? formToView(form, portrait, photos) : null),
    [step, form, portrait, photos],
  );

  const nextLabel =
    step === 2 && !form.timeline.length && !form.awards.length ? 'Skip for now'
    : step === PREVIEW_STEP - 1 ? 'See the preview'
    : 'Continue';
  const finalLabel = editing ? 'Save changes' : isAdmin ? 'Send for review' : 'Save and choose a plan';
  const blockedReason =
    step === 0 && !f.canNext ? 'Add a first and last name to continue.'
    : step === 1 && !f.canNext ? 'Write a few sentences of their story to continue.'
    : step === 2 && !f.canNext ? 'Fix the highlighted rows to continue.'
    : '';

  return (
    <>
      <StepProgress step={step} steps={steps} />

      <div ref={stepRef} tabIndex={-1} className="outline-none scroll-mt-24">
        {step === 0 && (
          <BasicInfoStep
            form={form} onChange={f.set} dateErrors={f.dateErrors} typeLocked={editing}
            portrait={portrait} onPortraitSelect={f.setPortrait} onPortraitRemove={() => f.setPortrait(null)}
          />
        )}
        {step === 1 && <StoryStep value={form.biography} onChange={(v) => f.set('biography', v)} editing={editing} />}
        {step === 2 && <LifeStep form={form} onChange={f.set} errors={f.lifeErrors} />}
        {step === 3 && (
          <div className={`${CARD} md:p-8 flex flex-col gap-5`}>
            <div className="flex flex-col gap-2">
              <h2 className="type-card-heading text-ink">Family photos</h2>
              <p className="type-body text-muted">
                Up to 10 photos for the gallery. Optional — the main photo is set on the first step.
              </p>
            </div>
            <PhotoStep photos={photos} onAdd={f.addPhotos} onRemove={f.removePhoto} />
          </div>
        )}
        {step === PREVIEW_STEP && view && (
          <PreviewStep view={view} apiError={f.apiError} uploadStatus={f.uploadStatus} notice={previewNotice} />
        )}
        {!editing && step === 5 && f.draftSlug && <PlanStep slug={f.draftSlug} warning={f.draftWarning} />}
      </div>

      {step <= PREVIEW_STEP && (
        <div className="mt-8 flex flex-col gap-3">
          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
              disabled={step === 0 || f.submitting}
              className={`${BTN_SECONDARY} ${step === 0 ? 'invisible' : ''}`}
            >
              <ArrowIcon direction="left" className="w-4 h-4" /> Back
            </button>

            {step < PREVIEW_STEP ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={!f.canNext}
                aria-describedby={blockedReason ? 'step-blocked' : undefined}
                className={`${BTN_PRIMARY} ml-auto`}
              >
                {nextLabel} <ArrowIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => (editing && slug ? f.save(slug) : f.create())}
                disabled={f.submitting}
                className={`${BTN_PRIMARY} ml-auto`}
              >
                {f.submitting ? (
                  <>
                    <span aria-hidden="true" className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin motion-reduce:animate-none" />
                    {f.uploadStatus || 'Saving…'}
                  </>
                ) : (
                  <>{finalLabel} <ArrowIcon className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
          {blockedReason && (
            <p id="step-blocked" className="type-caption text-muted text-right">{blockedReason}</p>
          )}
        </div>
      )}
    </>
  );
};
