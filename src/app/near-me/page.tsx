import { Suspense } from "react";
import NearMeClient from "./NearMeClient";

export default function NearMePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1400px] px-4 py-8 text-[var(--muted)] md:px-6">
          Loading near-you intelligence…
        </div>
      }
    >
      <NearMeClient />
    </Suspense>
  );
}
