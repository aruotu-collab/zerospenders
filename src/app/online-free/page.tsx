import { CategoryBrowse } from "@/components/CategoryBrowse";
import { signalsByCategory } from "@/lib/data";

export default function OnlineFreePage() {
  return (
    <CategoryBrowse
      title="ONLINE FREE"
      blurb="Software, AI, downloads, ebooks and tools you can claim without leaving home."
      signals={signalsByCategory("online")}
    />
  );
}
