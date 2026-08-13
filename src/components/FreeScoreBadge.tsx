export function FreeScoreBadge({
  score,
  size = "md",
  showLabel = false,
}: {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}) {
  const dim =
    size === "sm" ? "h-12 w-12 text-sm" : size === "lg" ? "h-24 w-24 text-3xl" : "h-16 w-16 text-lg";

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`score-ring relative grid place-items-center rounded-full p-[3px] ${dim}`}
        style={{ ["--score" as string]: score }}
      >
        <div className="grid h-full w-full place-items-center rounded-full bg-[var(--bg-elevated)]">
          <span className="font-mono font-bold text-[var(--accent)]">{score}</span>
        </div>
      </div>
      {showLabel && (
        <span className="text-[10px] tracking-[0.14em] text-[var(--muted)]">FREE SCORE</span>
      )}
    </div>
  );
}
