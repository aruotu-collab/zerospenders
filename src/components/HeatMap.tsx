import type { CityHeat } from "@/lib/types";

export function HeatMap({ cities }: { cities: CityHeat[] }) {
  return (
    <section className="surface rounded-2xl p-4 md:p-5">
      <div className="mb-4">
        <h2 className="font-display text-sm font-bold tracking-[0.14em] text-white">
          FREE ACTIVITY RIGHT NOW
        </h2>
        <p className="text-xs text-[var(--muted)]">
          {cities[0]?.city} is seeing unusually high FREE activity — {cities[0]?.newSignals} new
          signals detected.
        </p>
      </div>
      <ul className="space-y-3">
        {cities.map((city) => (
          <li key={city.city} className="grid grid-cols-[100px_1fr_auto] items-center gap-3 text-sm">
            <span className="font-medium text-[var(--text)]">{city.city}</span>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent)]/50 to-[var(--accent)]"
                style={{ width: `${city.level * 10}%` }}
              />
            </div>
            <span
              className={`font-mono text-[11px] font-bold ${
                city.label === "HOT" ? "text-[var(--alert)]" : city.label === "WARM" ? "text-[var(--warn)]" : "text-[var(--muted)]"
              }`}
            >
              {city.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
