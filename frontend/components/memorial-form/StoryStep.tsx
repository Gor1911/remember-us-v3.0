import { CARD, HINT } from '@/components/ui/styles';
import { describedById, Textarea } from './FormFields';
import { MIN_BIOGRAPHY_LENGTH } from './formTypes';

interface StoryStepProps {
  value: string;
  onChange: (value: string) => void;
  /** Editing an existing memorial (copy changes slightly). */
  editing?: boolean;
}

const PROMPTS = [
  'Where did they grow up, and who raised them?',
  'What did they do for work, or for others?',
  'Who did they love, and who loved them?',
  'What will people remember them saying or doing?',
];

/** The biography: a quiet writing space with a few questions to start from, no character counter. */
export const StoryStep = ({ value, onChange, editing }: StoryStepProps) => {
  const length = value.trim().length;
  const tooShort = length > 0 && length < MIN_BIOGRAPHY_LENGTH;
  return (
    <div className={`${CARD} md:p-8 flex flex-col gap-5`}>
      <div className="flex flex-col gap-2">
        <h2 className="type-card-heading text-ink">
          <label htmlFor="biography">Their story</label>
        </h2>
        <p className="type-body text-muted">
          Write it the way you would tell it to a friend. A few sentences is enough to begin
          {editing ? '.' : ' — you can add to it any time from your dashboard.'}
        </p>
      </div>

      <div className="rounded-[16px] bg-soft px-5 py-4">
        <p className="type-caption font-medium text-ink mb-2">If you’re not sure where to start</p>
        <ul className="flex flex-col gap-1.5 list-disc pl-5 marker:text-bronze">
          {PROMPTS.map((p) => <li key={p} className="type-caption text-muted">{p}</li>)}
        </ul>
      </div>

      <Textarea id="biography" value={value} rows={10} maxLength={20000} onChange={onChange} />
      <p id={describedById('biography')} aria-live="polite" className={HINT}>
        {tooShort
          ? `A little more, please — at least ${MIN_BIOGRAPHY_LENGTH} characters.`
          : 'Leave an empty line between paragraphs.'}
      </p>
    </div>
  );
};
