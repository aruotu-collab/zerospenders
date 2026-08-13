import { CategoryBrowse } from "@/components/CategoryBrowse";
import { signalsByCategory } from "@/lib/data";

export default function LearnFreePage() {
  return (
    <CategoryBrowse
      title="LEARN FREE"
      blurb="Increase your knowledge for £0 — courses, certificates, books, AI and skills."
      signals={signalsByCategory("learn")}
    />
  );
}
