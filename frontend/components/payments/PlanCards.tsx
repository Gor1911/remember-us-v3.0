import type { PackageType, Plan } from '@/app/lib/types';
import { PLANS } from '@/components/pricing/plans';

const priceLabel = (id: PackageType, fallback: string, plans: Plan[] | null) => {
  const plan = plans?.find((p) => p.id === id);
  if (!plan) return fallback;
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: plan.currency.toUpperCase(), maximumFractionDigits: 0,
  }).format(plan.amount_cents / 100);
};

interface PlanCardsProps {
  idPrefix: string;
  selected: PackageType;
  onSelect: (id: PackageType) => void;
  plans: Plan[] | null;
  disabled?: boolean;
}

/** Two selectable plan cards (radio group). */
export const PlanCards = ({ idPrefix, selected, onSelect, plans, disabled }: PlanCardsProps) => (
  <fieldset disabled={disabled} className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
    <legend className="sr-only">Choose a plan</legend>
    {PLANS.map((plan) => {
      const id = `${idPrefix}-${plan.id}`;
      return (
        <div key={plan.id} className="relative">
          <input
            id={id}
            type="radio"
            name={`${idPrefix}-plan`}
            value={plan.id}
            checked={selected === plan.id}
            onChange={() => onSelect(plan.id)}
            className="peer sr-only"
          />
          <label
            htmlFor={id}
            className="flex h-full cursor-pointer flex-col gap-3 rounded-[20px] border border-[#1A1614]/[0.15] bg-white p-5 transition-colors hover:bg-[#F3F0EB] peer-checked:border-[#8B0000] peer-checked:ring-1 peer-checked:ring-[#8B0000] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#8B0000]"
          >
            <span className="flex items-baseline justify-between gap-2">
              <span className="text-[#1A1614] font-semibold text-base">{plan.name}</span>
              {plan.highlight && (
                <span className="text-[10px] font-medium uppercase tracking-widest text-[#8B0000]">{plan.highlight}</span>
              )}
            </span>
            <span className="text-[#1A1614] font-bold text-2xl tracking-tight">
              {priceLabel(plan.id, plan.priceLabel, plans)}
              <span className="ml-1 text-xs font-normal text-[#6B6560]">one-time</span>
            </span>
            <span className="text-[#6B6560] text-xs leading-relaxed">{plan.tagline}</span>
            <ul className="flex flex-col gap-1.5 text-xs text-[#1A1614] leading-snug">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span aria-hidden="true" className="text-[#2F6B4F]">&#10003;</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </label>
        </div>
      );
    })}
  </fieldset>
);
