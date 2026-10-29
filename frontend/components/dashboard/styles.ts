/** Shared button/field classes for dashboard, payments and access UI. */
const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]';

export const BTN_PRIMARY =
  `inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[14px] bg-[#8B0000] hover:bg-[#A00000] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${FOCUS}`;

export const BTN_SECONDARY =
  `inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[14px] bg-white border border-[#1A1614]/[0.15] text-[#1A1614] text-sm font-medium hover:bg-[#F3F0EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${FOCUS}`;

export const BTN_DANGER =
  `inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[14px] bg-white border border-[#8B0000]/40 text-[#8B0000] text-sm font-medium hover:bg-[#8B0000]/[0.05] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${FOCUS}`;

export const BTN_SM =
  `inline-flex items-center justify-center px-4 py-2 rounded-[12px] text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${FOCUS}`;

export const FIELD =
  'w-full bg-white border border-[#1A1614]/[0.15] rounded-[12px] px-4 py-3 text-[#1A1614] text-sm outline-none focus:border-[#8B0000] focus-visible:ring-2 focus-visible:ring-[#8B0000]/30';

export const LABEL = 'text-[#6B6560] text-sm font-medium';
