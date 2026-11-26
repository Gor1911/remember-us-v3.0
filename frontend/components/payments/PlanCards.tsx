import type { PackageType, Plan } from '@/app/lib/types';
import { PLANS } from '@/components/pricing/plans';
import { CheckIcon, TickIcon } from '@/components/ui/icons';

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

/**
 * Two selectable plan cards (radio group), styled like the landing pricing cards:
 * Standard on white, Premium on ink. The chosen card gets an ink ring offset from the canvas.
 */
export const PlanCards = ({ idPrefix, selected, onSelect, plans, disabled }: PlanCardsProps) => (
  <fieldset disabled={disabled} className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
    <legend className="sr-only">Choose a plan</legend>
    {PLANS.map((plan) => {
      const id = `${idPrefix}-${plan.id}`;
      const dark = plan.id === 'premium';
      const checked = selected === plan.id;
      return (
        <div key={plan.id} className="relative">
          <input
            id={id}
            type="radio"
            name={`${idPrefix}-plan`}
            value={plan.id}
            checked={checked}
            onChange={() => onSelect(plan.id)}
            className="peer sr-only"
          />
          <label
            htmlFor={id}
            className={`flex h-full cursor-pointer flex-col gap-4 rounded-tile p-6 transition-[opacity,box-shadow] duration-300 hover:opacity-95 peer-checked:ring-2 peer-checked:ring-ink peer-checked:ring-offset-4 peer-checked:ring-offset-canvas peer-focus-visible:outline-2 peer-focus-visible:outline-offset-8 peer-focus-visible:outline-bronze-deep peer-disabled:cursor-not-allowed ${
              dark ? 'bg-ink text-white' : 'bg-white text-ink'
            }`}
          >
            <span className="flex items-center justify-between gap-3">
              <span className="type-card-heading">{plan.name}</span>
              <span
                aria-hidden="true"
                className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center ${
                  checked
                    ? (dark ? 'bg-white text-ink' : 'bg-ink text-white')
                    : (dark ? 'ring-1 ring-inset ring-white/40' : 'ring-1 ring-inset ring-ink/20')
                }`}
              >
                {checked && <TickIcon className="w-3.5 h-3.5" />}
              </span>
            </span>
            <span className="flex items-baseline gap-2 flex-wrap">
              <span className="type-stat">{priceLabel(plan.id, plan.priceLabel, plans)}</span>
              <span className={`type-caption ${dark ? 'text-linen' : 'text-muted'}`}>one-time</span>
            </span>
            <span className={`type-caption ${dark ? 'text-linen' : 'text-muted'}`}>{plan.tagline}</span>
            <ul className="flex flex-col gap-2.5 list-none">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2.5 type-caption">
                  <CheckIcon className={`w-5 h-5 shrink-0 mt-px ${dark ? 'text-linen' : 'text-bronze'}`} />
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
