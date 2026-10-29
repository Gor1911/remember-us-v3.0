import { CheckIcon } from '@/components/dashboard/Icons';
import { STEPS, type Step } from './formTypes';

interface StepProgressProps {
  step: Step;
}

export const StepProgress = ({ step }: StepProgressProps) => (
  <ol className="flex items-center gap-2 mb-10 flex-wrap">
    {STEPS.map((label, i) => {
      const done = i < step;
      const current = i === step;
      return (
        <li key={label} className="flex items-center gap-2" aria-current={current ? 'step' : undefined}>
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium transition-colors duration-300 ${
              done ? 'bg-[#8B0000] text-white'
              : current ? 'bg-[#8B0000]/10 border border-[#8B0000] text-[#8B0000]'
              : 'bg-white border border-[#1A1614]/[0.12] text-muted'
            }`}
          >
            {done ? <CheckIcon className="w-3.5 h-3.5" /> : i + 1}
          </div>
          <span
            className={`text-xs font-medium hidden sm:block ${
              current ? 'text-[#1A1614]' : done ? 'text-[#6B6560]' : 'text-muted'
            }`}
          >
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <div className={`h-px w-6 md:w-12 ${done ? 'bg-[#8B0000]/50' : 'bg-[#1A1614]/[0.12]'}`} />
          )}
        </li>
      );
    })}
  </ol>
);
