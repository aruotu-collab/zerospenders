import { SignalCard } from "@/components/SignalCard";
import { ShareDeal } from "@/components/ShareDeal";
import type { FreeSignal } from "@/lib/types";

export function BoardSignalItem({
  signal,
  badge,
  badgeClassName,
}: {
  signal: FreeSignal;
  badge: string;
  badgeClassName: string;
}) {
  return (
    <div className="relative">
      <div
        className={`absolute right-3 top-3 z-10 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${badgeClassName}`}
      >
        {badge}
      </div>
      <SignalCard signal={signal} />
      <div className="mt-2 flex justify-end px-1">
        <ShareDeal
          signalId={signal.id}
          title={signal.title}
          normalValue={signal.normalValue}
          variant="compact"
          authed
        />
      </div>
    </div>
  );
}
