'use client';

import { useModal } from '@/app/context/ModalContext';
import { PhotoCtaBand } from '@/components/landing/PhotoCtaBand';

/** Landing closing line — the meadow photo bookends the hero; follows the sand FAQ chapter. */
export function CtaBanner() {
  const { handleCreateClick } = useModal();

  return (
    <PhotoCtaBand
      titleId="cta-title"
      title="Begin their memorial today"
      support="A place where their story stays — for your children, and for theirs."
      note="Drafts are free. You pay once, when you submit the memorial for review."
      fadeFrom="sand"
    >
      <button type="button" onClick={handleCreateClick} className="pill pill-dark">
        Create memorial
      </button>
    </PhotoCtaBand>
  );
}
