import type { ReactNode } from 'react';

const CONTROL =
  'w-full bg-white border border-[#1A1614]/[0.12] rounded-[12px] px-4 py-3 text-[#1A1614] text-sm placeholder:text-[#8A7F74] outline-none focus:border-[#8B0000]/50 transition-colors [color-scheme:light]';

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}

export const Field = ({ label, htmlFor, hint, children }: FieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={htmlFor} className="text-[#6B6560] text-[11px] uppercase tracking-widest font-medium">
      {label}
    </label>
    {children}
    {hint && <p className="text-[#8A7F74] text-xs">{hint}</p>}
  </div>
);

interface InputProps {
  id: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const Input = ({ id, type = 'text', value, onChange, placeholder, required }: InputProps) => (
  <input
    id={id} type={type} value={value} placeholder={placeholder} required={required}
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
}

export const Textarea = ({ id, value, onChange, placeholder, rows = 12 }: TextareaProps) => (
  <textarea
    id={id} value={value} rows={rows} placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    className={`${CONTROL} resize-none leading-relaxed`}
  />
);
