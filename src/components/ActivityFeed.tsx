"use client";

import { useEffect, useState } from "react";
import type { ActivityItem } from "@/lib/types";

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const [visible, setVisible] = useState(items);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible((prev) => {
        const [first, ...rest] = prev;
        return [...rest, { ...first, minsAgo: 0, id: `${first.id}-${Date.now()}` }];
      });
    }, 4200);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="surface flex h-full flex-col rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-bold tracking-[0.14em] text-white">
          PEOPLE ARE CLAIMING
        </h2>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--accent)]">
          <span className="live-dot" />
          LIVE
        </span>
      </div>
      <ul className="space-y-2 overflow-hidden">
        {visible.slice(0, 7).map((item, index) => (
          <li
            key={item.id}
            className="feed-item flex items-start gap-3 border-b border-[var(--border)]/70 py-2 text-sm last:border-0"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            <div className="min-w-0 flex-1">
              <p className="text-[var(--text)]">{item.text}</p>
              <p className="mt-0.5 font-mono text-[11px] text-[var(--faint)]">
                {item.minsAgo === 0 ? "just now" : `${item.minsAgo}m ago`}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
