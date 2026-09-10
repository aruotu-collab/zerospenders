"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminSubmissions } from "@/components/AdminSubmissions";

type Member = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  postcode: string | null;
  radiusMiles: number;
  interests: string[];
  savedGBP: number;
  createdAt: Date | string;
  claims: number;
  watches: number;
};

type Submission = {
  id: string;
  title: string;
  summary: string;
  category: string;
  country: string;
  city: string;
  claimUrl: string | null;
  claimPhone: string | null;
  claimEmail: string | null;
  howToClaim: string | null;
  normalValue: number;
  source: string;
  autoScore: number | null;
  createdAt: string | Date;
  hunter: string;
};

type DiscoveryRun = {
  id: string;
  kind: string;
  found: number;
  queued: number;
  published: number;
  skipped: number;
  createdAt: Date | string;
};

export type AdminDashboardStats = {
  days: number;
  memberCount: number;
  visitCount: number;
  clickCount: number;
  uniqueIpCount: number;
  membersByRole: Record<string, number>;
  members: Member[];
  topClicks: { label: string; type: string; id: string | null; count: number }[];
  topPaths: { path: string; count: number }[];
  topSources: { source: string; count: number }[];
  recentVisits: {
    id: string;
    path: string;
    referrer: string | null;
    source: string | null;
    ip: string | null;
    country: string | null;
    createdAt: Date | string;
  }[];
  recentClicks: {
    id: string;
    path: string;
    targetType: string;
    targetLabel: string | null;
    targetId: string | null;
    href: string | null;
    ip: string | null;
    createdAt: Date | string;
  }[];
  topIps: { ip: string; visits: number; lastSeen: Date | string; source: string }[];
  pendingSubmissions: Submission[];
  discoveryRuns: DiscoveryRun[];
};

type TabId = "members" | "visits" | "clicks" | "ips";

function fmt(date: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(typeof date === "string" ? new Date(date) : date);
}

const TABS: { id: TabId; label: string; countKey: keyof AdminDashboardStats }[] = [
  { id: "members", label: "Members", countKey: "memberCount" },
  { id: "visits", label: "Visits", countKey: "visitCount" },
  { id: "clicks", label: "Clicks", countKey: "clickCount" },
  { id: "ips", label: "Unique IPs", countKey: "uniqueIpCount" },
];

export function AdminDashboard({
  email,
  stats,
}: {
  email: string;
  stats: AdminDashboardStats;
}) {
  const [tab, setTab] = useState<TabId>("members");

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent)]">ADMIN</p>
        <h1 className="font-display mt-2 text-4xl font-bold text-white md:text-5xl">
          Site intelligence
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Signed in as {email}. Last {stats.days} days of visits and clicks.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Admin sections"
        className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {TABS.map(({ id, label, countKey }) => {
          const active = tab === id;
          const value = Number(stats[countKey]);
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              id={`admin-tab-${id}`}
              aria-controls={`admin-panel-${id}`}
              onClick={() => setTab(id)}
              className={`surface rounded-xl p-4 text-left transition ${
                active
                  ? "border border-[var(--accent)]/50 bg-[var(--accent-dim)] ring-1 ring-[var(--accent)]/30"
                  : "hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
              }`}
            >
              <p
                className={`text-[11px] font-semibold tracking-[0.14em] ${
                  active ? "text-[var(--accent)]" : "text-[var(--faint)]"
                }`}
              >
                {label}
              </p>
              <p className="font-display mt-2 text-3xl font-bold text-white">
                {value.toLocaleString()}
              </p>
            </button>
          );
        })}
      </div>

      <AdminSubmissions submissions={stats.pendingSubmissions} />

      <section className="surface mb-8 rounded-xl p-5">
        <h2 className="font-display text-lg font-semibold text-white">Daily discovery runs</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Cron scans Reddit, Eventbrite and RSS every day at 06:00 UTC. Recheck runs Sundays at 05:00
          UTC.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-[11px] tracking-[0.12em] text-[var(--faint)]">
              <tr>
                <th className="pb-2 pr-3 font-semibold">When</th>
                <th className="pb-2 pr-3 font-semibold">Job</th>
                <th className="pb-2 pr-3 font-semibold">Found</th>
                <th className="pb-2 pr-3 font-semibold">Queued</th>
                <th className="pb-2 pr-3 font-semibold">Published</th>
                <th className="pb-2 font-semibold">Skipped</th>
              </tr>
            </thead>
            <tbody>
              {stats.discoveryRuns.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-[var(--muted)]">
                    No runs yet — set CRON_SECRET on Vercel and deploy, or run npm run discovery:run
                    locally.
                  </td>
                </tr>
              )}
              {stats.discoveryRuns.map((r) => (
                <tr key={r.id} className="border-t border-[var(--border)]/60">
                  <td className="py-2 pr-3 text-[var(--muted)]">{fmt(r.createdAt)}</td>
                  <td className="py-2 pr-3 text-[var(--text)]">{r.kind}</td>
                  <td className="py-2 pr-3 font-mono text-[var(--info)]">{r.found}</td>
                  <td className="py-2 pr-3 font-mono text-[var(--warn)]">{r.queued}</td>
                  <td className="py-2 pr-3 font-mono text-[var(--accent)]">{r.published}</td>
                  <td className="py-2 font-mono text-[var(--muted)]">{r.skipped}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {tab === "members" && (
        <div
          role="tabpanel"
          id="admin-panel-members"
          aria-labelledby="admin-tab-members"
          className="space-y-8"
        >
          <section className="surface rounded-xl p-5">
            <h2 className="font-display text-lg font-semibold text-white">Members</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              All registered accounts — email, location, role and activity. Country is not stored on
              the profile yet; postcode is the location we collect at signup.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="text-[11px] tracking-[0.12em] text-[var(--faint)]">
                  <tr>
                    <th className="pb-2 pr-3 font-semibold">Name</th>
                    <th className="pb-2 pr-3 font-semibold">Email</th>
                    <th className="pb-2 pr-3 font-semibold">Role</th>
                    <th className="pb-2 pr-3 font-semibold">Postcode</th>
                    <th className="pb-2 pr-3 font-semibold">Radius</th>
                    <th className="pb-2 pr-3 font-semibold">Interests</th>
                    <th className="pb-2 pr-3 font-semibold">Claims</th>
                    <th className="pb-2 pr-3 font-semibold">Watching</th>
                    <th className="pb-2 pr-3 font-semibold">Saved</th>
                    <th className="pb-2 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.members.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-4 text-[var(--muted)]">
                        No members yet.
                      </td>
                    </tr>
                  )}
                  {stats.members.map((m) => (
                    <tr key={m.id} className="border-t border-[var(--border)]/60 align-top">
                      <td className="py-2.5 pr-3 text-[var(--text)]">{m.name || "—"}</td>
                      <td className="py-2.5 pr-3 font-mono text-[var(--info)]">{m.email}</td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={
                            m.role === "ADMIN"
                              ? "font-semibold text-[var(--warn)]"
                              : "text-[var(--muted)]"
                          }
                        >
                          {m.role}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-[var(--muted)]">{m.postcode || "—"}</td>
                      <td className="py-2.5 pr-3 text-[var(--muted)]">{m.radiusMiles} mi</td>
                      <td className="py-2.5 pr-3 text-[var(--muted)]">
                        {m.interests.length ? m.interests.join(", ") : "—"}
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-[var(--accent)]">{m.claims}</td>
                      <td className="py-2.5 pr-3 font-mono text-[var(--accent)]">{m.watches}</td>
                      <td className="py-2.5 pr-3 font-mono text-[var(--muted)]">
                        £{m.savedGBP.toFixed(0)}
                      </td>
                      <td className="py-2.5 text-[var(--muted)]">{fmt(m.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="surface rounded-xl p-5">
            <h2 className="font-display text-lg font-semibold text-white">Members by role</h2>
            <ul className="mt-4 space-y-2">
              {Object.entries(stats.membersByRole).map(([role, count]) => (
                <li
                  key={role}
                  className="flex items-center justify-between gap-3 border-b border-[var(--border)]/60 py-2 text-sm last:border-0"
                >
                  <span className="text-[var(--text)]">{role}</span>
                  <span className="font-mono text-[var(--accent)]">{count.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {tab === "visits" && (
        <div
          role="tabpanel"
          id="admin-panel-visits"
          aria-labelledby="admin-tab-visits"
          className="space-y-8"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="surface rounded-xl p-5">
              <h2 className="font-display text-lg font-semibold text-white">How they found the site</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Referrers / UTM sources (google, facebook, direct, …)
              </p>
              <ul className="mt-4 space-y-2">
                {stats.topSources.length === 0 && (
                  <li className="text-sm text-[var(--muted)]">No visits recorded yet.</li>
                )}
                {stats.topSources.map((row) => (
                  <li
                    key={row.source}
                    className="flex items-center justify-between gap-3 border-b border-[var(--border)]/60 py-2 text-sm last:border-0"
                  >
                    <span className="truncate text-[var(--text)]">{row.source}</span>
                    <span className="font-mono text-[var(--accent)]">
                      {row.count.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="surface rounded-xl p-5">
              <h2 className="font-display text-lg font-semibold text-white">Top pages</h2>
              <ul className="mt-4 space-y-2">
                {stats.topPaths.length === 0 && (
                  <li className="text-sm text-[var(--muted)]">No page views yet.</li>
                )}
                {stats.topPaths.map((row) => (
                  <li
                    key={row.path}
                    className="flex items-center justify-between gap-3 border-b border-[var(--border)]/60 py-2 text-sm last:border-0"
                  >
                    <Link href={row.path} className="truncate text-[var(--info)] hover:underline">
                      {row.path}
                    </Link>
                    <span className="font-mono text-[var(--accent)]">
                      {row.count.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="surface rounded-xl p-5">
            <h2 className="font-display text-lg font-semibold text-white">Recent visits</h2>
            <ul className="mt-4 max-h-[520px] space-y-2 overflow-y-auto">
              {stats.recentVisits.length === 0 && (
                <li className="text-sm text-[var(--muted)]">No visits yet.</li>
              )}
              {stats.recentVisits.map((row) => (
                <li
                  key={row.id}
                  className="border-b border-[var(--border)]/60 py-2 text-sm last:border-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-[var(--text)]">{row.path}</span>
                    <span className="text-[11px] text-[var(--faint)]">{fmt(row.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--muted)]">
                    {row.ip || "no-ip"} · {row.source || "direct"}
                    {row.country ? ` · ${row.country}` : ""}
                    {row.referrer ? ` · ref ${row.referrer}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {tab === "clicks" && (
        <div
          role="tabpanel"
          id="admin-panel-clicks"
          aria-labelledby="admin-tab-clicks"
          className="space-y-8"
        >
          <section className="surface rounded-xl p-5">
            <h2 className="font-display text-lg font-semibold text-white">What people click</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Top targets in the last {stats.days} days
            </p>
            <ul className="mt-4 space-y-2">
              {stats.topClicks.length === 0 && (
                <li className="text-sm text-[var(--muted)]">No clicks recorded yet.</li>
              )}
              {stats.topClicks.map((row) => (
                <li
                  key={`${row.type}-${row.id}-${row.label}`}
                  className="flex items-start justify-between gap-3 border-b border-[var(--border)]/60 py-2 text-sm last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--text)]">{row.label}</p>
                    <p className="text-[11px] text-[var(--faint)]">
                      {row.type}
                      {row.id ? ` · ${row.id}` : ""}
                    </p>
                  </div>
                  <span className="font-mono text-[var(--accent)]">{row.count.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="surface rounded-xl p-5">
            <h2 className="font-display text-lg font-semibold text-white">Recent clicks</h2>
            <ul className="mt-4 max-h-[520px] space-y-2 overflow-y-auto">
              {stats.recentClicks.length === 0 && (
                <li className="text-sm text-[var(--muted)]">No clicks yet.</li>
              )}
              {stats.recentClicks.map((row) => (
                <li
                  key={row.id}
                  className="border-b border-[var(--border)]/60 py-2 text-sm last:border-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-[var(--text)]">
                      {row.targetLabel || row.targetId || row.targetType}
                    </span>
                    <span className="text-[11px] text-[var(--faint)]">{fmt(row.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--muted)]">
                    {row.targetType} · from {row.path} · {row.ip || "no-ip"}
                    {row.href ? ` · ${row.href}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {tab === "ips" && (
        <div role="tabpanel" id="admin-panel-ips" aria-labelledby="admin-tab-ips">
          <section className="surface rounded-xl p-5">
            <h2 className="font-display text-lg font-semibold text-white">Visitor IPs</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Unique addresses finding the site, with visit count and latest acquisition source
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-[11px] tracking-[0.12em] text-[var(--faint)]">
                  <tr>
                    <th className="pb-2 font-semibold">IP</th>
                    <th className="pb-2 font-semibold">Visits</th>
                    <th className="pb-2 font-semibold">Source</th>
                    <th className="pb-2 font-semibold">Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topIps.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-[var(--muted)]">
                        No IP data yet — browse the site after deploy to start collecting.
                      </td>
                    </tr>
                  )}
                  {stats.topIps.map((row) => (
                    <tr key={row.ip} className="border-t border-[var(--border)]/60">
                      <td className="py-2 font-mono text-[var(--text)]">{row.ip}</td>
                      <td className="py-2 font-mono text-[var(--accent)]">{row.visits}</td>
                      <td className="py-2 text-[var(--muted)]">{row.source}</td>
                      <td className="py-2 text-[var(--muted)]">{fmt(row.lastSeen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
