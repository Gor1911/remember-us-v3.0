'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { ArrowIcon } from '@/components/ui/icons';
import { FOCUS, LINK, NOTICE_INFO, PAGE } from '@/components/ui/styles';
import { MemorialFormFlow } from '@/components/memorial-form/MemorialFormFlow';
import { SuccessScreen } from '@/components/memorial-form/SuccessScreen';
import { useDraftAutosave } from '@/components/memorial-form/useDraftAutosave';
import { useMemorialForm } from '@/components/memorial-form/useMemorialForm';
import { EMPTY_FORM, PREVIEW_STEP } from '@/components/memorial-form/formTypes';

/** Form column; the preview step widens to the memorial's own width. */
const COLUMN = 'w-[min(100%-32px,720px)] mx-auto';
const WIDE = 'w-[min(100%-32px,1064px)] mx-auto';

const savedTime = (t: number) =>
  new Date(t).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export default function NewMemorialPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 'admin';
  const f = useMemorialForm(isAdmin);
  const { form, photos, portrait } = f;
  // Keep unsent text in this browser until the draft exists on the server.
  const autosave = useDraftAutosave(form, f.setForm, !f.draftSlug && !f.created);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (f.draftSlug || f.created) autosave.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.draftSlug, f.created]);

  if (loading) {
    return (
      <main id="main" className="min-h-screen bg-canvas flex items-center justify-center">
        <span className="type-caption text-muted" role="status">Loading…</span>
      </main>
    );
  }

  if (f.created) {
    return (
      <SuccessScreen
        name={`${form.first_name} ${form.last_name}`}
        portraitPreview={portrait?.preview ?? null}
        photoCount={photos.length}
        submitted={f.created.submitted}
        warning={f.created.warning}
      />
    );
  }

  return (
    <main id="main" className={PAGE}>
      <div className={f.step === PREVIEW_STEP ? WIDE : COLUMN}>
        <Link
          href="/dashboard"
          className={`inline-flex items-center gap-2 min-h-11 type-caption font-medium text-muted hover:text-ink transition-colors no-underline mb-6 rounded-sm ${FOCUS}`}
        >
          <ArrowIcon direction="left" className="w-4 h-4" /> My memorials
        </Link>

        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-8">
          <h1 className="type-footer-heading text-ink">Create a memorial</h1>
          {autosave.savedAt && !f.draftSlug && (
            <p className="type-caption text-muted" role="status">Saved on this device</p>
          )}
        </div>

        {autosave.restoredAt && (
          <div className={`${NOTICE_INFO} mb-6 flex flex-wrap items-center justify-between gap-3`} role="status">
            <span>
              We kept what you wrote on {savedTime(autosave.restoredAt)}. Photos need to be added again.
            </span>
            <span className="flex gap-4">
              <button type="button" className={`type-caption font-medium ${LINK}`} onClick={autosave.dismissRestored}>
                Continue
              </button>
              <button
                type="button" className={`type-caption font-medium ${LINK}`}
                onClick={() => { autosave.clear(); f.setForm(EMPTY_FORM); f.setStep(0); }}
              >
                Start over
              </button>
            </span>
          </div>
        )}

        <MemorialFormFlow f={f} mode="create" isAdmin={isAdmin} />
      </div>
    </main>
  );
}
