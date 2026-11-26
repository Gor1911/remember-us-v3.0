import type { PlanCopy } from '@/components/pricing/plans';
import { CheckIcon } from '@/components/ui/icons';

interface PlanCardProps {
  plan: PlanCopy;
  onSelect: (id: PlanCopy['id']) => void;
}

/** Full plan card: price, what's included, one action. Premium is set in the dark ink tone. */
export const PlanCard = ({ plan, onSelect }: PlanCardProps) => {
  const dark = plan.id === 'premium';
  return (
    <article
      aria-labelledby={`plan-${plan.id}`}
      className={`h-full rounded-tile p-6 md:p-8 flex flex-col gap-5 ${dark ? 'bg-ink text-white' : 'bg-white text-ink'}`}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 id={`plan-${plan.id}`} className="type-card-heading">{plan.name}</h3>
        {dark && <span className="rounded-full bg-white/15 px-3 py-1 type-utility">With Living Portrait</span>}
      </div>
      <p className="flex items-baseline gap-2 flex-wrap">
        <span className="type-stat">{plan.priceLabel}</span>
        <span className={`type-caption ${dark ? 'text-linen' : 'text-muted'}`}>one-time · no renewals</span>
      </p>
      <p className={`type-body ${dark ? 'text-linen' : 'text-muted'}`}>{plan.tagline}</p>
      <ul className="flex flex-col gap-3 list-none flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-3 type-body">
            <CheckIcon className={`w-6 h-6 shrink-0 ${dark ? 'text-linen' : 'text-bronze'}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onSelect(plan.id)}
        className={`pill self-start ${dark ? 'pill-light' : 'pill-dark'}`}
      >
        Choose {plan.name} · {plan.priceLabel}
      </button>
    </article>
  );
};
