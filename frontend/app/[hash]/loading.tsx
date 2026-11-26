export default function Loading() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-bronze animate-pulse motion-reduce:animate-none" />
        <p className="type-caption text-muted">Opening the memorial…</p>
      </div>
    </div>
  );
}
