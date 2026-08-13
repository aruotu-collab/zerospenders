import { CategoryBrowse } from "@/components/CategoryBrowse";
import { signalsByCategory } from "@/lib/data";

export default function GetFreePage() {
  return (
    <CategoryBrowse
      title="GET FREE"
      blurb="Physical things coming your way — samples, beauty, home, baby, pets and giveaways."
      signals={signalsByCategory("get")}
    />
  );
}
