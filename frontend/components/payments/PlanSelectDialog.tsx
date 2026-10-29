'use client';

import { DialogShell } from '@/components/dashboard/DialogShell';
import { BTN_SECONDARY } from '@/components/dashboard/styles';
import { PlanCheckoutForm } from './PlanCheckoutForm';

interface PlanSelectDialogProps {
  slug: string;
  name: string;
  onClose: () => void;
  /** Page was already paid — refresh the list and close. */
  onAlreadyPaid: () => void;
}

export const PlanSelectDialog = ({ slug, name, onClose, onAlreadyPaid }: PlanSelectDialogProps) => (
  <DialogShell title="Choose a plan" titleId="plan-dialog-title" onClose={onClose}>
    <p className="text-[#6B6560] text-sm leading-relaxed">
      Paying submits the memorial for {name} for review. Your draft stays saved until then.
    </p>
    <PlanCheckoutForm slug={slug} idPrefix="plan-dialog" onAlreadyPaid={() => { onAlreadyPaid(); onClose(); }}>
      <button type="button" onClick={onClose} className={BTN_SECONDARY}>Cancel</button>
    </PlanCheckoutForm>
  </DialogShell>
);
