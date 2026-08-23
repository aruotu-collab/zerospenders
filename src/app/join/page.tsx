import { Suspense } from "react";
import JoinPageClient from "./join-client";

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[720px] px-4 py-10 md:px-6">
          <p className="text-sm text-[var(--muted)]">Loading…</p>
        </div>
      }
    >
      <JoinPageClient />
    </Suspense>
  );
}
