import type { PageType } from '@/app/lib/types';
import { TypeIcon } from '@/components/dashboard/Icons';
import { Field, Input } from './FormFields';
import type { DateErrors, FormState, PhotoEntry } from './formTypes';
import { PortraitPicker } from './PortraitPicker';

interface BasicInfoStepProps {
  form: FormState;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  dateErrors: DateErrors;
  portrait: PhotoEntry | null;
  onPortraitSelect: (file: File) => void;
  onPortraitRemove: () => void;
}

const TYPES: PageType[] = ['civilian', 'military'];

export const BasicInfoStep = ({
  form, onChange, dateErrors, portrait, onPortraitSelect, onPortraitRemove,
}: BasicInfoStepProps) => {
  const isMilitary = form.page_type === 'military';
  return (
    <div className="glass rounded-[32px] p-6 md:p-10 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
        <PortraitPicker portrait={portrait} onSelect={onPortraitSelect} onRemove={onPortraitRemove} />

        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <Field label="Memorial Type">
            <div className="flex gap-2">
              {TYPES.map((t) => (
                <button
                  key={t} type="button" aria-pressed={form.page_type === t}
                  onClick={() => onChange('page_type', t)}
                  className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium rounded-[12px] border transition-colors capitalize ${
                    form.page_type === t
                      ? 'bg-[#8B0000] border-[#8B0000] text-white'
                      : 'bg-white border-[#1A1614]/[0.12] text-[#6B6560] hover:text-[#1A1614] hover:border-[#1A1614]/25'
                  }`}
                >
                  <TypeIcon type={t} /> {t}
                </button>
              ))}
            </div>
          </Field>
          <Field label="First Name" htmlFor="first_name">
            <Input id="first_name" value={form.first_name} onChange={(v) => onChange('first_name', v)} placeholder="William" required />
          </Field>
          <Field label="Last Name" htmlFor="last_name">
            <Input id="last_name" value={form.last_name} onChange={(v) => onChange('last_name', v)} placeholder="Davis" required />
          </Field>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Date of Birth" htmlFor="birth_date" hint="Optional">
          <Input
            id="birth_date" type="date" value={form.birth_date} max={form.death_date}
            onChange={(v) => onChange('birth_date', v)}
          />
        </Field>
        <Field label="Date of Passing" htmlFor="death_date" hint="Optional" error={dateErrors.death_date}>
          <Input
            id="death_date" type="date" value={form.death_date} min={form.birth_date}
            invalid={!!dateErrors.death_date} onChange={(v) => onChange('death_date', v)}
          />
        </Field>
      </div>

      {isMilitary && (
        <>
          <div className="h-px bg-[#1A1614]/[0.08]" />
          <div className="flex items-center gap-2 -mb-2">
            <span className="w-1 h-1 rounded-full bg-[#8B0000]" />
            <span className="text-[#6B6560] text-[11px] uppercase tracking-wider font-medium">Military Service</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Rank" htmlFor="military_rank" hint="Optional">
              <Input id="military_rank" value={form.military_rank} onChange={(v) => onChange('military_rank', v)} placeholder="Chief Master Sergeant" />
            </Field>
            <Field label="Branch" htmlFor="military_branch" hint="Optional">
              <Input id="military_branch" value={form.military_branch} onChange={(v) => onChange('military_branch', v)} placeholder="U.S. Air Force" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Service Start" htmlFor="service_start" hint="Optional">
              <Input
                id="service_start" type="date" value={form.service_start} max={form.service_end}
                onChange={(v) => onChange('service_start', v)}
              />
            </Field>
            <Field label="Service End" htmlFor="service_end" hint="Optional" error={dateErrors.service_end}>
              <Input
                id="service_end" type="date" value={form.service_end} min={form.service_start}
                invalid={!!dateErrors.service_end} onChange={(v) => onChange('service_end', v)}
              />
            </Field>
          </div>
        </>
      )}
    </div>
  );
};
