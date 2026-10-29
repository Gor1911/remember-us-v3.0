import type { PlanCopy } from '@/components/pricing/plans';
import { PRICE_NOTE } from '@/components/pricing/plans';

interface PlanCardProps {
  plan: PlanCopy;
  onSelect: (id: PlanCopy['id']) => void;
}

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-[#8A7F74]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.3 2.4 2.4 4.6-5" />
  </svg>
);

export const PlanCard = ({ plan, onSelect }: PlanCardProps) => {
  const featured = Boolean(plan.highlight);
  return (
    <article
      aria-labelledby={`plan-${plan.id}`}
      className={`pricing-card relative flex flex-col gap-6 rounded-[32px] bento-pad ${
        featured
          ? 'bg-white border-2 border-[#8B0000]/70 shadow-[0_30px_60px_rgba(139,0,0,0.10)]'
          : 'glass'
      }`}
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-8 rounded-full bg-[#8B0000] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-white">
          {plan.highlight}
        </span>
      )}
      <div className="flex flex-col gap-2">
        <h3 id={`plan-${plan.id}`} className="text-[#1A1614] text-xl font-semibold">{plan.name}</h3>
        <p className="text-muted text-[15px] leading-relaxed">{plan.tagline}</p>
      </div>
      <p className="text-[#1A1614] flex items-baseline gap-2">
        <span className="text-5xl font-bold tracking-tight">{plan.priceLabel}</span>
        <span className="text-muted text-sm">one-time</span>
      </p>
      <ul className="flex flex-col gap-3 list-none flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-3 text-[15px] leading-snug text-[#1A1614]">
            <CheckIcon />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onSelect(plan.id)}
          className={`w-full rounded-[14px] py-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000] ${
            featured
              ? 'bg-[#8B0000] text-white hover:bg-[#A00000]'
              : 'border border-[#1A1614]/20 text-[#1A1614] hover:bg-[#1A1614]/5'
          }`}
        >
          Select {plan.name} ({plan.priceLabel})
        </button>
        <p className="text-muted text-center text-xs">{PRICE_NOTE}</p>
      </div>
    </article>
  );
};
