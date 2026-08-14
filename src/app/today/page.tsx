import { CategoryBrowse } from "@/components/CategoryBrowse";
import { listSignals } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const signals = await listSignals();
  const today = signals.filter(
    (s) => s.status === "live" || s.status === "new" || (s.endsInHours !== undefined && s.endsInHours < 24)
  );

  return (
    <CategoryBrowse
      title="FREE TODAY"
      blurb={`${today.length} things you can do or get FREE near you today — available right now.`}
      signals={today}
    />
  );
}
