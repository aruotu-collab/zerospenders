import { CategoryBrowse } from "@/components/CategoryBrowse";
import { signalsByCategory } from "@/lib/data";

export default function TryFreePage() {
  return (
    <CategoryBrowse
      title="TRY FREE"
      blurb="Normally paid products you can test — software, apps, gyms, streaming and services."
      signals={signalsByCategory("try")}
    />
  );
}
