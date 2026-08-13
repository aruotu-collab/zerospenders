import { CategoryBrowse } from "@/components/CategoryBrowse";
import { signalsByCategory } from "@/lib/data";

export default function KidsFreePage() {
  return (
    <CategoryBrowse
      title="KIDS FREE"
      blurb="Family activities, children's offers and school-holiday freebies that actually work."
      signals={signalsByCategory("kids")}
    />
  );
}
