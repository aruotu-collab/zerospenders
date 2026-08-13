import { CategoryBrowse } from "@/components/CategoryBrowse";
import { signalsByCategory } from "@/lib/data";

export default function GoFreePage() {
  return (
    <CategoryBrowse
      title="GO FREE"
      blurb="Things happening around you — attractions, museums, events, exercise and days out."
      signals={signalsByCategory("go")}
    />
  );
}
