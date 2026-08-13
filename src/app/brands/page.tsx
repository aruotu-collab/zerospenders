import Link from "next/link";

export default function BrandsPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-6">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--exclusive)]">
          FREE FOR BRANDS
        </p>
        <h1 className="font-display mt-2 text-4xl font-bold text-white md:text-6xl">
          Put your product in front of people who want FREE.
        </h1>
        <p className="mt-4 text-lg text-[var(--muted)]">
          Launch creator drops, sample campaigns and exclusive freebie listings. Reach members,
          nano-creators and UGC makers who already hunt for £0 opportunities.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Starter Drop",
            price: "£199",
            detail: "Up to 20 creators · matching · compliance checklist",
          },
          {
            title: "Growth Drop",
            price: "£599",
            detail: "Up to 100 creators · priority placement · analytics",
          },
          {
            title: "National Drop",
            price: "£1,999+",
            detail: "Hundreds of creators · featured board · campaign support",
          },
        ].map((tier) => (
          <div key={tier.title} className="surface rounded-2xl p-5">
            <div className="font-display text-xl font-bold text-white">{tier.title}</div>
            <div className="mt-2 font-mono text-3xl font-bold text-[var(--accent)]">{tier.price}</div>
            <p className="mt-2 text-sm text-[var(--muted)]">{tier.detail}</p>
          </div>
        ))}
      </div>

      <section className="surface mt-8 rounded-2xl p-6 md:p-8">
        <h2 className="font-display text-2xl font-bold text-white">Launch a campaign</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Demo form — connect this to your CRM or backend when ready.
        </p>
        <form className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["Product", "New energy drink"],
            ["Products available", "500"],
            ["Retail value", "£2.50"],
            ["Target location", "UK"],
            ["Age range", "18–35"],
            ["Desired creators", "5k–50k followers"],
          ].map(([label, placeholder]) => (
            <label key={label} className="block text-sm">
              <span className="text-[var(--muted)]">{label}</span>
              <input
                placeholder={placeholder}
                className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-white outline-none focus:border-[var(--accent)]/50"
              />
            </label>
          ))}
          <label className="block text-sm md:col-span-2">
            <span className="text-[var(--muted)]">Interests / platforms</span>
            <input
              placeholder="Fitness, TikTok, Instagram"
              className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-white outline-none focus:border-[var(--accent)]/50"
            />
          </label>
        </form>
        <div className="mt-6 rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-dim)] p-4">
          <div className="font-mono text-sm text-[var(--accent)]">MATCH PREVIEW</div>
          <p className="mt-2 text-white">
            12,481 creators match · estimated reach 4.8m · 843 highly relevant
          </p>
        </div>
        <button className="mt-6 rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[#04140f]">
          Launch Creator Drop →
        </button>
      </section>

      <p className="mt-6 text-sm text-[var(--muted)]">
        Also available: sponsored freebie listings, sample distribution, local business boosts and
        FREE Compliance agreements for ASA/FTC-ready disclosure.{" "}
        <Link href="/join" className="text-[var(--accent)]">
          Talk to us
        </Link>
      </p>
    </div>
  );
}
