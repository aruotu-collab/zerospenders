import { CategoryBrowse } from "@/components/CategoryBrowse";
import { SIGNALS } from "@/lib/data";

export default function TodayPage() {
  const today = SIGNALS.filter(
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
