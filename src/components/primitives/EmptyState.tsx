const DEATH_NOTE_GIF_URL =
  "https://media4.giphy.com/media/v1.Y2lkPWEzMWYxNGI5cW1wejdtODdhNTV3NTQxZGhzdXN3NHMxOWM5MnVlenF3dDNvbHhneiZlcD12MV9naWZzX2dpZklkJmN0PWc/3pTtbLJ7Jd0YM/giphy.gif";

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <img src={DEATH_NOTE_GIF_URL} alt="" className="w-64 rounded-lg border-2 border-ink" />
      <p className="max-w-[14rem] text-center text-xs uppercase tracking-wide text-ink-muted">
        {message}
      </p>
    </div>
  );
}
