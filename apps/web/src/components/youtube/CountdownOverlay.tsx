export function CountdownOverlay({ secondsLeft }: { secondsLeft: number | null }) {
  if (secondsLeft === null) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/78 backdrop-blur-sm">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--accent)]">Countdown</p>
        <p className="mt-2 text-7xl font-semibold text-white">{Math.max(0, secondsLeft)}</p>
      </div>
    </div>
  );
}
