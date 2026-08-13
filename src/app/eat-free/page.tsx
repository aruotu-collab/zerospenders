import { CategoryBrowse } from "@/components/CategoryBrowse";
import { signalsByCategory } from "@/lib/data";

export default function EatFreePage() {
  return (
    <CategoryBrowse
      title="EAT FREE"
      blurb="Food and drink for £0 — coffee, tastings, birthday desserts and kids-eat-free."
      signals={signalsByCategory("eat")}
    />
  );
}
