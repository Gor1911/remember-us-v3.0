'use client';

import Link from 'next/link';
import { useModal } from '@/app/context/ModalContext';
import { PhotoCtaBand } from '@/components/landing/PhotoCtaBand';

/** Closing band of the example — the same photo band as the landing page, after the white memorial. */
export function ExampleCta() {
  const { handleCreateClick } = useModal();

  return (
    <PhotoCtaBand
      titleId="example-cta-title"
      eyebrow="Create your memorial"
      title="Honor your loved one with a memorial your family can return to for generations."
      titleClassName="type-footer-heading max-w-[640px]"
      note="Drafts are free. You pay once, when you submit the memorial for review."
      fadeFrom="white"
    >
      <button type="button" onClick={handleCreateClick} className="pill pill-dark">
        Create memorial
      </button>
      <Link href="/#pricing" className="pill pill-soft">
        See pricing
      </Link>
    </PhotoCtaBand>
  );
}
