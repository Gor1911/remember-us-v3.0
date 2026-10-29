export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-[#8B0000] animate-pulse" />
        <p className="text-[#8A7F74] text-xs tracking-widest uppercase">Loading memorial…</p>
      </div>
    </div>
  );
}
