import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
      <div className="text-center flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
          <span className="text-[#9BA4B5] text-[11px] uppercase tracking-[0.14em] font-medium">
            Memorial Not Found
          </span>
        </div>
        <h1 className="text-white font-bold text-3xl tracking-tight">
          This memorial is private or does not exist.
        </h1>
        <p className="text-white/30 text-sm max-w-sm">
          Access requires a personal QR code. If you received a link, please check it and try again.
        </p>
        <Link
          href="/"
          className="px-6 py-3 glass text-white/60 hover:text-white text-sm rounded-[14px] transition-colors no-underline"
        >
          ← Return to Remember US
        </Link>
      </div>
    </div>
  );
}
