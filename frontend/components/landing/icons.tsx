interface IconProps {
  className?: string;
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function LockIcon({ className = 'w-7 h-7' }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      <path d="M12 14.5v2" />
    </svg>
  );
}

export function BookIcon({ className = 'w-7 h-7' }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 6.5C10.5 5.3 8.2 4.8 5 5v13c3.2-.2 5.5.3 7 1.5 1.5-1.2 3.8-1.7 7-1.5V5c-3.2-.2-5.5.3-7 1.5Z" />
      <path d="M12 6.5v13" />
    </svg>
  );
}

export function PhotoIcon({ className = 'w-7 h-7' }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="5" width="17" height="14" rx="3" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m4 17 4.5-4.5a1.5 1.5 0 0 1 2.1 0L15 17" />
      <path d="m13.5 15.5 1.4-1.4a1.5 1.5 0 0 1 2.1 0L20 17" />
    </svg>
  );
}

export function MedalIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M8 3.5 10.5 9M16 3.5 13.5 9" />
      <circle cx="12" cy="15" r="5" />
      <path d="m12 12.8.7 1.4 1.5.2-1.1 1.1.3 1.5-1.4-.7-1.4.7.3-1.5-1.1-1.1 1.5-.2Z" />
    </svg>
  );
}

export function CloseIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
