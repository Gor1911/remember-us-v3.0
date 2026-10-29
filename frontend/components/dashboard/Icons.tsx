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

export const PersonIcon = ({ className = 'w-4 h-4' }: IconProps) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
  </svg>
);

export const StarIcon = ({ className = 'w-4 h-4' }: IconProps) => (
  <svg {...base} className={className}>
    <path d="m12 3.5 2.6 5.3 5.9.9-4.25 4.1 1 5.8L12 16.8 6.75 19.6l1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />
  </svg>
);

export const CheckIcon = ({ className = 'w-4 h-4' }: IconProps) => (
  <svg {...base} className={className}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const CameraIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.2-2h5.6L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-9Z" />
    <circle cx="12" cy="13" r="3.25" />
  </svg>
);

export const CloseIcon = ({ className = 'w-4 h-4' }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const PlusIcon = ({ className = 'w-4 h-4' }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const ArrowRightIcon = ({ className = 'w-4 h-4' }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const ArrowLeftIcon = ({ className = 'w-4 h-4' }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

interface TypeIconProps extends IconProps {
  type: 'civilian' | 'military';
}

export const TypeIcon = ({ type, className }: TypeIconProps) =>
  type === 'military' ? <StarIcon className={className} /> : <PersonIcon className={className} />;
