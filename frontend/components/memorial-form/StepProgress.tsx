import { TickIcon } from '@/components/ui/icons';
import type { Step } from './formTypes';

interface StepProgressProps {
  step: Step;
  steps: readonly string[];
}

/** Calm row of numbered steps: current = ink circle, done = sage tick, upcoming = outline. */
export const StepProgress = ({ step, steps }: StepProgressProps) => (
  <nav aria-label="Progress" className="mb-10">
    <ol className="flex items-center gap-2 sm:gap-3 w-full">
      {steps.map((label, i) => {
        const done = i < step;
        const current = i === step;
        const last = i === steps.length - 1;
        return (
          <li
            key={label}
            className={`flex items-center gap-2 sm:gap-3 ${last ? '' : 'flex-1'}`}
            aria-current={current ? 'step' : undefined}
          >
            <span
              aria-hidden="true"
              className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-display font-medium text-[14px] transition-colors duration-300 ${
                done ? 'bg-sage/10 text-sage'
                : current ? 'bg-ink text-white'
                : 'border border-ink/15 text-muted'
              }`}
            >
              {done ? <TickIcon className="w-4 h-4" /> : i + 1}
            </span>
            <span className="sr-only">
              Step {i + 1}: {label}{done ? ', done' : current ? ', current' : ''}
            </span>
            <span
              aria-hidden="true"
              className={`type-caption whitespace-nowrap hidden md:block ${current ? 'text-ink font-medium' : 'text-muted'}`}
            >
              {label}
            </span>
            {!last && (
              <span aria-hidden="true" className={`h-px flex-1 min-w-3 ${done ? 'bg-sage/40' : 'bg-ink/15'}`} />
            )}
          </li>
        );
      })}
    </ol>
    <p aria-hidden="true" className="md:hidden mt-3 type-caption text-muted">
      Step {step + 1} of {steps.length}: <span className="text-ink font-medium">{steps[step]}</span>
    </p>
  </nav>
);
