import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-6">
      <div className="text-center flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
          <span className="text-muted text-[11px] uppercase tracking-[0.14em] font-medium">
            Memorial Not Found
          </span>
        </div>
        <h1 className="text-[#1A1614] font-bold text-3xl tracking-tight">
          This memorial is private or does not exist.
        </h1>
        <p className="text-[#6B6560] text-sm max-w-sm leading-relaxed">
          Access requires a personal QR code. If you received a link, please check it and try again.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-white border border-[#1A1614]/10 text-[#6B6560] hover:text-[#1A1614] text-sm rounded-[14px] transition-colors no-underline"
        >
          ← Return to Remember US
        </Link>
      </div>
    </div>
  );
}
