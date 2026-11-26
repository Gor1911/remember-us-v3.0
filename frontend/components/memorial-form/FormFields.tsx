import type { ReactNode } from 'react';
import { ERROR_TEXT, FIELD, HINT, LABEL } from '@/components/ui/styles';

const CONTROL = `${FIELD} aria-[invalid=true]:border-danger [color-scheme:light]`;

/** Id of the hint/error line under a control; controls point at it with aria-describedby. */
export const describedById = (id: string) => `${id}-desc`;

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  /** Validation message; replaces the hint while present. */
  error?: string;
  children: ReactNode;
}

export const Field = ({ label, htmlFor, hint, error, children }: FieldProps) => {
  const descId = htmlFor ? describedById(htmlFor) : undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className={LABEL}>
        {label}
      </label>
      {children}
      {error
        ? <p id={descId} role="alert" className={ERROR_TEXT}>{error}</p>
        : hint && <p id={descId} className={HINT}>{hint}</p>}
    </div>
  );
};

interface GroupFieldProps {
  legend: string;
  hint?: string;
  children: ReactNode;
}

/** A labelled group of controls (e.g. two choice tiles): fieldset + legend instead of a bare label. */
export const GroupField = ({ legend, hint, children }: GroupFieldProps) => (
  <fieldset className="flex flex-col gap-2 min-w-0">
    <legend className={`${LABEL} mb-2`}>{legend}</legend>
    {children}
    {hint && <p className={HINT}>{hint}</p>}
  </fieldset>
);

interface InputProps {
  id: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
  invalid?: boolean;
  inputMode?: 'numeric' | 'text';
  autoComplete?: string;
  maxLength?: number;
  /** Accessible name when there is no visible <label for> (rows in a list). */
  ariaLabel?: string;
  /** Id of a <datalist> with suggestions. */
  list?: string;
}

export const Input = ({
  id, type = 'text', value, onChange, placeholder, required, min, max, invalid, inputMode, autoComplete, maxLength, ariaLabel, list,
}: InputProps) => (
  <input
    id={id} type={type} value={value} placeholder={placeholder} required={required} list={list}
    min={min || undefined} max={max || undefined} aria-invalid={invalid || undefined}
    aria-describedby={describedById(id)} aria-label={ariaLabel}
    inputMode={inputMode} autoComplete={autoComplete} maxLength={maxLength}
    onChange={(e) => onChange(e.target.value)}
    className={CONTROL}
  />
);

interface TextareaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  ariaLabel?: string;
  maxLength?: number;
}

export const Textarea = ({ id, value, onChange, placeholder, rows = 12, ariaLabel, maxLength }: TextareaProps) => (
  <textarea
    id={id} value={value} rows={rows} placeholder={placeholder} aria-label={ariaLabel} maxLength={maxLength}
    aria-describedby={describedById(id)}
    onChange={(e) => onChange(e.target.value)}
    className={`${CONTROL} resize-y min-h-24`}
  />
);
