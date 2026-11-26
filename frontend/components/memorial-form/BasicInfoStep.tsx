import type { PageType } from '@/app/lib/types';
import { TypeIcon } from '@/components/dashboard/Icons';
import { CARD, FOCUS } from '@/components/ui/styles';
import { Field, GroupField, Input } from './FormFields';
import type { DateErrors, FormState, PhotoEntry } from './formTypes';
import { PortraitPicker } from './PortraitPicker';

interface BasicInfoStepProps {
  form: FormState;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  dateErrors: DateErrors;
  portrait: PhotoEntry | null;
  onPortraitSelect: (file: File) => void;
  onPortraitRemove: () => void;
  /** Editing an existing memorial: the type is fixed once created. */
  typeLocked?: boolean;
}

const TYPES: { value: PageType; label: string }[] = [
  { value: 'civilian', label: 'Civilian life' },
  { value: 'military', label: 'Served in the military' },
];

/** Selectable white tile; the chosen one gets an ink ring. */
const TILE_BASE =
  `flex-1 min-h-12 px-3 py-2 flex items-center justify-center gap-2 rounded-[14px] bg-white type-action text-center transition-shadow duration-300 disabled:cursor-not-allowed ${FOCUS}`;
const TILE_ON = 'ring-2 ring-ink text-ink';
const TILE_OFF = 'ring-1 ring-ink/15 text-muted hover:ring-ink/30 hover:text-ink disabled:hover:ring-ink/15 disabled:hover:text-muted';

export const BasicInfoStep = ({
  form, onChange, dateErrors, portrait, onPortraitSelect, onPortraitRemove, typeLocked,
}: BasicInfoStepProps) => {
  const isMilitary = form.page_type === 'military';
  return (
    <div className={`${CARD} md:p-8 flex flex-col gap-6`}>
      <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
        <PortraitPicker portrait={portrait} onSelect={onPortraitSelect} onRemove={onPortraitRemove} />

        <div className="flex-1 flex flex-col gap-5 min-w-0">
          <Field label="First name" htmlFor="first_name">
            <Input id="first_name" value={form.first_name} onChange={(v) => onChange('first_name', v)} placeholder="William" autoComplete="off" maxLength={100} required />
          </Field>
          <Field label="Last name" htmlFor="last_name">
            <Input id="last_name" value={form.last_name} onChange={(v) => onChange('last_name', v)} placeholder="Davis" autoComplete="off" maxLength={100} required />
          </Field>
        </div>
      </div>

      <GroupField
        legend="Their life"
        hint={typeLocked
          ? 'This can’t be changed after the memorial is created.'
          : 'A military memorial adds rank, service dates and honors.'}
      >
        <div className="flex gap-3">
          {TYPES.map((t) => (
            <button
              key={t.value} type="button" aria-pressed={form.page_type === t.value}
              disabled={typeLocked && form.page_type !== t.value}
              onClick={() => onChange('page_type', t.value)}
              className={`${TILE_BASE} ${form.page_type === t.value ? TILE_ON : TILE_OFF}`}
            >
              <TypeIcon type={t.value} className="w-5 h-5 shrink-0 text-bronze" /> {t.label}
            </button>
          ))}
        </div>
      </GroupField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Date of birth" htmlFor="birth_date" hint="Optional">
          <Input
            id="birth_date" type="date" value={form.birth_date} max={form.death_date}
            onChange={(v) => onChange('birth_date', v)}
          />
        </Field>
        <Field label="Date of passing" htmlFor="death_date" hint="Optional" error={dateErrors.death_date}>
          <Input
            id="death_date" type="date" value={form.death_date} min={form.birth_date}
            invalid={!!dateErrors.death_date} onChange={(v) => onChange('death_date', v)}
          />
        </Field>
      </div>

      {isMilitary && (
        <fieldset className="flex flex-col gap-5 border-t border-ink/10 pt-6 min-w-0">
          <legend className="sr-only">Military service</legend>
          <p aria-hidden="true" className="type-card-heading text-ink -mb-1">Military service</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Rank" htmlFor="military_rank" hint="Optional">
              <Input id="military_rank" value={form.military_rank} onChange={(v) => onChange('military_rank', v)} placeholder="Chief Master Sergeant" maxLength={100} />
            </Field>
            <Field label="Branch" htmlFor="military_branch" hint="Optional">
              <Input id="military_branch" value={form.military_branch} onChange={(v) => onChange('military_branch', v)} placeholder="U.S. Air Force" maxLength={100} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Service start" htmlFor="service_start" hint="Optional">
              <Input
                id="service_start" type="date" value={form.service_start} max={form.service_end}
                onChange={(v) => onChange('service_start', v)}
              />
            </Field>
            <Field label="Service end" htmlFor="service_end" hint="Optional" error={dateErrors.service_end}>
              <Input
                id="service_end" type="date" value={form.service_end} min={form.service_start}
                invalid={!!dateErrors.service_end} onChange={(v) => onChange('service_end', v)}
              />
            </Field>
          </div>
        </fieldset>
      )}
    </div>
  );
};
