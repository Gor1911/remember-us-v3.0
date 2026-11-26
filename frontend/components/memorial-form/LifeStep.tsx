import { CloseIcon, PlusIcon } from '@/components/ui/icons';
import { BTN_SECONDARY, CARD, ERROR_TEXT, FOCUS, HINT } from '@/components/ui/styles';
import { describedById, Input } from './FormFields';
import {
  MAX_LIFE_ROWS, newKey,
  type AwardRow, type FormState, type TimelineRow,
} from './formTypes';

interface LifeStepProps {
  form: FormState;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  errors: Record<string, string>;
}

/** Common U.S. decorations, offered as suggestions; any name can be typed. */
const AWARD_SUGGESTIONS = [
  'Medal of Honor', 'Distinguished Service Cross', 'Navy Cross', 'Air Force Cross', 'Silver Star',
  'Distinguished Flying Cross', 'Bronze Star Medal', 'Purple Heart', 'Air Medal', 'Army Commendation Medal',
  'Navy and Marine Corps Commendation Medal', 'Air Force Commendation Medal', 'Good Conduct Medal',
  'Prisoner of War Medal', 'World War II Victory Medal', 'Korean Service Medal', 'Vietnam Service Medal',
  'Southwest Asia Service Medal', 'Global War on Terrorism Service Medal', 'National Defense Service Medal',
  'Combat Infantryman Badge', 'Combat Action Ribbon',
];

const REMOVE =
  `shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-muted hover:text-danger hover:bg-danger/[0.06] transition-colors ${FOCUS}`;
const ROW = 'rounded-[16px] bg-soft p-4 flex flex-col gap-3';

function update<T extends { key: string }>(rows: T[], key: string, patch: Partial<T>): T[] {
  return rows.map((r) => (r.key === key ? { ...r, ...patch } : r));
}

export const LifeStep = ({ form, onChange, errors }: LifeStepProps) => {
  const military = form.page_type === 'military';
  const setTimeline = (rows: TimelineRow[]) => onChange('timeline', rows);
  const setAwards = (rows: AwardRow[]) => onChange('awards', rows);

  return (
    <div className="flex flex-col gap-4">
      <section className={`${CARD} md:p-8 flex flex-col gap-5`} aria-labelledby="life-heading">
        <div className="flex flex-col gap-2">
          <h2 id="life-heading" className="type-card-heading text-ink">Moments in their life</h2>
          <p className="type-body text-muted">
            Where they were born, a wedding, a first child, a move across the country. Guests see these as a
            timeline. Optional — add as many or as few as you like.
          </p>
        </div>

        {form.timeline.length > 0 && (
          <ol className="flex flex-col gap-3 list-none">
            {form.timeline.map((r, i) => {
              const id = `tl-${r.key}`;
              const error = errors[r.key];
              return (
                <li key={r.key} className={ROW}>
                  <div className="flex items-start gap-3">
                    <div className="w-24 shrink-0">
                      <Input
                        id={`${id}-year`} value={r.year} inputMode="numeric" maxLength={4} placeholder="Year"
                        ariaLabel={`Moment ${i + 1}: year`} invalid={!!error}
                        onChange={(v) => setTimeline(update(form.timeline, r.key, { year: v.replace(/\D/g, '') }))}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Input
                        id={`${id}-title`} value={r.title} maxLength={200} placeholder="What happened"
                        ariaLabel={`Moment ${i + 1}: what happened`} invalid={!!error && !!r.year}
                        onChange={(v) => setTimeline(update(form.timeline, r.key, { title: v }))}
                      />
                    </div>
                    <button
                      type="button" className={REMOVE} aria-label={`Remove moment ${i + 1}`}
                      onClick={() => setTimeline(form.timeline.filter((x) => x.key !== r.key))}
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <Input
                    id={`${id}-desc`} value={r.description} maxLength={1000} placeholder="A detail, a place (optional)"
                    ariaLabel={`Moment ${i + 1}: detail`}
                    onChange={(v) => setTimeline(update(form.timeline, r.key, { description: v }))}
                  />
                  {error && <p id={describedById(`${id}-year`)} role="alert" className={ERROR_TEXT}>{error}</p>}
                </li>
              );
            })}
          </ol>
        )}

        {form.timeline.length < MAX_LIFE_ROWS ? (
          <button
            type="button" className={`${BTN_SECONDARY} self-start`}
            onClick={() => setTimeline([...form.timeline, { key: newKey(), year: '', title: '', description: '' }])}
          >
            <PlusIcon className="w-4 h-4" /> {form.timeline.length ? 'Add another moment' : 'Add a moment'}
          </button>
        ) : (
          <p className={HINT}>That’s the most moments one memorial can hold ({MAX_LIFE_ROWS}).</p>
        )}
      </section>

      {military && (
        <section className={`${CARD} md:p-8 flex flex-col gap-5`} aria-labelledby="honors-heading">
          <div className="flex flex-col gap-2">
            <h2 id="honors-heading" className="type-card-heading text-ink">Military honors</h2>
            <p className="type-body text-muted">
              Medals, decorations and badges. Start typing for suggestions, or write the name as it appears on
              their papers.
            </p>
          </div>

          <datalist id="award-suggestions">
            {AWARD_SUGGESTIONS.map((a) => <option key={a} value={a} />)}
          </datalist>

          {form.awards.length > 0 && (
            <ul className="flex flex-col gap-3 list-none">
              {form.awards.map((r, i) => {
                const id = `aw-${r.key}`;
                const error = errors[r.key];
                return (
                  <li key={r.key} className={ROW}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <Input
                          id={`${id}-name`} list="award-suggestions" value={r.name} maxLength={200}
                          placeholder="Purple Heart" ariaLabel={`Honor ${i + 1}: name`} invalid={!!error}
                          onChange={(v) => setAwards(update(form.awards, r.key, { name: v }))}
                        />
                      </div>
                      <button
                        type="button" className={REMOVE} aria-label={`Remove honor ${i + 1}`}
                        onClick={() => setAwards(form.awards.filter((x) => x.key !== r.key))}
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-3">
                      <Input
                        id={`${id}-date`} type="date" value={r.date} ariaLabel={`Honor ${i + 1}: date awarded (optional)`}
                        max={new Date().toISOString().slice(0, 10)}
                        onChange={(v) => setAwards(update(form.awards, r.key, { date: v }))}
                      />
                      <Input
                        id={`${id}-desc`} value={r.description} maxLength={1000} placeholder="What it was for (optional)"
                        ariaLabel={`Honor ${i + 1}: what it was for`}
                        onChange={(v) => setAwards(update(form.awards, r.key, { description: v }))}
                      />
                    </div>
                    {error && <p id={describedById(`${id}-name`)} role="alert" className={ERROR_TEXT}>{error}</p>}
                  </li>
                );
              })}
            </ul>
          )}

          {form.awards.length < MAX_LIFE_ROWS && (
            <button
              type="button" className={`${BTN_SECONDARY} self-start`}
              onClick={() => setAwards([...form.awards, { key: newKey(), name: '', date: '', description: '' }])}
            >
              <PlusIcon className="w-4 h-4" /> {form.awards.length ? 'Add another honor' : 'Add an honor'}
            </button>
          )}
        </section>
      )}
    </div>
  );
};
