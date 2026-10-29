import type { PortraitStatus } from '@/app/lib/types';

/** Owner/admin-facing wording for each Living Portrait status. */
export const PORTRAIT_STATUS_LABEL: Record<PortraitStatus, string> = {
  none: 'not included',
  pending: 'waiting for approval',
  processing: 'in progress',
  done: 'ready',
  failed: "needs attention — we'll contact you",
};
