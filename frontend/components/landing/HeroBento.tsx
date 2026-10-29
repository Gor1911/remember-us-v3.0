import Image from 'next/image';
import Link from 'next/link';

interface TimelineEvent {
  year: string;
  label: string;
  accent: boolean;
}

const EVENTS: TimelineEvent[] = [
  { year: '1924', label: 'Born',                 accent: false },
  { year: '1943', label: 'Enlisted',             accent: false },
  { year: '1945', label: 'Pacific Theater · WWII', accent: true  },
  { year: '2023', label: 'Passed',               accent: false },
];

export function HeroPortraitCard() {
  return (
    <Link
      href="/example"
      className="bento-cell glass relative overflow-hidden block group h-[280px] md:row-span-2 md:h-auto md:min-h-[480px] lg:min-h-[560px]"
    >
      <Image
        src="/images/portrait-placeholder.jpg"
        alt="Portrait of William R. Davis"
        fill priority
        sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-[#1A1614]/0 group-hover:bg-[#1A1614]/10 transition-colors duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#F3F0EB] via-[#F3F0EB]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 bento-pad">
        <p className="uppercase text-muted text-[10px] mb-1.5 tracking-wide font-medium">In Memory Of</p>
        <h3 className="text-[#1A1614] text-lg font-semibold leading-snug">Chief Master Sergeant</h3>
        <p className="text-muted text-sm mt-1 font-mono">U.S. Air Force · WWII Veteran</p>
      </div>
      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 border border-[#1A1614]/10">
        <span className="text-[#1A1614] text-[10px] font-medium tracking-wider uppercase">Example</span>
      </div>
      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B0000] border border-[#8B0000]">
        <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
        <span className="text-white text-[10px] font-medium tracking-wider uppercase">Veteran</span>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-muted text-[11px] tracking-widest uppercase font-medium">View Memorial →</span>
      </div>
    </Link>
  );
}

export function HeroQrTile() {
  return (
    <div className="bento-cell glass bento-pad flex flex-col items-center justify-between gap-3">
      <span className="uppercase text-muted text-[10px] tracking-wide font-medium self-start">QR</span>
      <div className="p-2.5 rounded-xl bg-white border border-[#1A1614]/[0.08]">
        <Image
          src="/images/qr-example.svg"
          alt="Example QR code for the Remember US example memorial"
          width={29} height={29} unoptimized
          className="w-[87px] h-[87px] [image-rendering:pixelated]"
        />
      </div>
      <p className="text-muted text-[10px] tracking-wide">Link only</p>
    </div>
  );
}

export function HeroTimelineTile() {
  return (
    <div className="bento-cell glass bento-pad flex flex-col">
      <span className="uppercase text-muted text-[10px] tracking-wide font-medium mb-3">Bio</span>
      <div className="flex flex-col">
        {EVENTS.map((ev, i) => (
          <div key={ev.year}>
            <div className="flex items-center gap-2.5">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ev.accent ? 'bg-[#8B0000]' : 'bg-[#1A1614]/20'}`} />
              <span className="text-muted text-[10px] font-mono pl-2">{ev.year}</span>
            </div>
            <div className="flex gap-2.5">
              <div className="flex justify-center w-1.5 shrink-0">
                {i < EVENTS.length - 1 && <div className="w-px h-6 bg-[#1A1614]/[0.08]" />}
              </div>
              <p className={`text-[11px] leading-snug pt-0.5 pb-1 pl-2 ${ev.accent ? 'text-[#1A1614] font-medium' : 'text-muted'}`}>
                {ev.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
