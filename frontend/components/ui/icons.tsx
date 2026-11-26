/**
 * Duotone icon set: a 1.75px rounded outline over a soft 16% fill of the same colour.
 * Colour comes from `currentColor` — set it with a text-* class.
 */

interface IconProps {
  className?: string;
}

interface GlyphProps extends IconProps {
  /** Closed shapes — outlined and softly filled. */
  body: string[];
  /** Detail strokes drawn on top. */
  lines?: string[];
}

function Duotone({ body, lines = [], className = 'w-6 h-6' }: GlyphProps) {
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {body.map((d) => <path key={`f${d}`} d={d} fill="currentColor" opacity={0.16} />)}
      {body.map((d) => <path key={`s${d}`} d={d} {...stroke} />)}
      {lines.map((d) => <path key={`l${d}`} d={d} {...stroke} />)}
    </svg>
  );
}

const CIRCLE = 'M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18Z';
const square = (x: number, y: number) =>
  `M${x + 1.5} ${y}h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 ${x} ${y + 4.5}v-3A1.5 1.5 0 0 1 ${x + 1.5} ${y}Z`;

export const LockIcon = ({ className }: IconProps) => (
  <Duotone
    className={className}
    body={['M7.5 10.5h9a2.5 2.5 0 0 1 2.5 2.5v4.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 17.5V13a2.5 2.5 0 0 1 2.5-2.5Z']}
    lines={['M8 10.5V8a4 4 0 0 1 8 0v2.5', 'M12 14v2.5']}
  />
);

export const BookIcon = ({ className }: IconProps) => (
  <Duotone
    className={className}
    body={['M12 6.5C10.5 5.3 8.2 4.8 5 5v13c3.2-.2 5.5.3 7 1.5 1.5-1.2 3.8-1.7 7-1.5V5c-3.2-.2-5.5.3-7 1.5Z']}
    lines={['M12 6.5v13']}
  />
);

export const PhotoIcon = ({ className }: IconProps) => (
  <Duotone
    className={className}
    body={['M6.5 5h11a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z']}
    lines={['M9 8.5a1.5 1.5 0 1 1 0 3a1.5 1.5 0 1 1 0-3Z', 'm4 17 4.5-4.5a1.5 1.5 0 0 1 2.1 0L15 17', 'm13.5 15.5 1.4-1.4a1.5 1.5 0 0 1 2.1 0L20 17']}
  />
);

export const QrIcon = ({ className }: IconProps) => (
  <Duotone
    className={className}
    body={[square(4, 4), square(14, 4), square(4, 14)]}
    lines={['M14.5 14.5h2v2h-2Z', 'M18 18h1.5v1.5H18Z', 'M14.5 19h1', 'M19 14.5v1']}
  />
);

export const CheckIcon = ({ className }: IconProps) => (
  <Duotone className={className} body={[CIRCLE]} lines={['m8.5 12.3 2.4 2.4 4.6-5']} />
);

export const PlusIcon = ({ className }: IconProps) => (
  <Duotone className={className} body={[CIRCLE]} lines={['M12 8v8', 'M8 12h8']} />
);

export const ClockIcon = ({ className }: IconProps) => (
  <Duotone className={className} body={[CIRCLE]} lines={['M12 7.5V12l3 2']} />
);

export const SparkIcon = ({ className }: IconProps) => (
  <Duotone
    className={className}
    body={['M12 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5Z']}
    lines={['M18.5 16v3', 'M17 17.5h3']}
  />
);

export const MedalIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <Duotone
    className={className}
    body={['M12 10a5 5 0 1 1 0 10a5 5 0 1 1 0-10Z']}
    lines={['M8 3.5 10.5 9', 'M16 3.5 13.5 9', 'm12 12.8.7 1.4 1.5.2-1.1 1.1.3 1.5-1.4-.7-1.4.7.3-1.5-1.1-1.1 1.5-.2Z']}
  />
);

export const PersonIcon = ({ className }: IconProps) => (
  <Duotone
    className={className}
    body={['M12 4.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 1 1 0-7Z', 'M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6Z']}
  />
);

export const StarIcon = ({ className }: IconProps) => (
  <Duotone
    className={className}
    body={['m12 3.5 2.6 5.3 5.9.9-4.25 4.1 1 5.8L12 16.8 6.75 19.6l1-5.8L3.5 9.7l5.9-.9L12 3.5Z']}
  />
);

export const CameraIcon = ({ className }: IconProps) => (
  <Duotone
    className={className}
    body={['M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.2-2h5.6L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-9Z']}
    lines={['M12 9.75a3.25 3.25 0 1 1 0 6.5a3.25 3.25 0 1 1 0-6.5Z']}
  />
);

export const TrashIcon = ({ className }: IconProps) => (
  <Duotone
    className={className}
    body={['M6.5 7h11l-.8 11.2a2 2 0 0 1-2 1.8H9.3a2 2 0 0 1-2-1.8L6.5 7Z']}
    lines={['M4.5 7h15', 'M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7', 'M10.5 11v5', 'M13.5 11v5']}
  />
);

export const DownloadIcon = ({ className }: IconProps) => (
  <Duotone
    className={className}
    body={['M5 15.5h14v2a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 17.5v-2Z']}
    lines={['M12 4v10', 'm8 10 4 4 4-4']}
  />
);

export const LinkIcon = ({ className }: IconProps) => (
  <Duotone
    className={className}
    body={['M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1', 'M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1']}
  />
);

export const FlagIcon = ({ className }: IconProps) => (
  <Duotone
    className={className}
    body={['M5.5 4.5h11l-2 4 2 4h-11v-8Z']}
    lines={['M5.5 4.5V20']}
  />
);

/** Plain line glyphs (no fill) for controls. */
const LINE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** Simple tick for dense lists and inline states. */
export const TickIcon = ({ className = 'w-4 h-4' }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" {...LINE} /></svg>
);

export const CloseIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" {...LINE} /></svg>
);

interface ArrowIconProps extends IconProps {
  direction?: 'left' | 'right';
}

export const ArrowIcon = ({ className = 'w-5 h-5', direction = 'right' }: ArrowIconProps) => (
  <svg viewBox="0 0 24 24" className={`${className} ${direction === 'left' ? 'rotate-180' : ''}`} aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" {...LINE} />
  </svg>
);
