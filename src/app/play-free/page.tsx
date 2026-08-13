import { CategoryBrowse } from "@/components/CategoryBrowse";
import { signalsByCategory } from "@/lib/data";

export default function PlayFreePage() {
  return (
    <CategoryBrowse
      title="PLAY FREE"
      blurb="Entertainment without the bill — games, streaming unlocks, sport and activities."
      signals={signalsByCategory("play")}
    />
  );
}
