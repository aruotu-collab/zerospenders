import { auth } from "@/auth";
import { SubmitOfferForm } from "@/components/SubmitOfferForm";

export const dynamic = "force-dynamic";

export default async function SubmitOfferPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-[720px] px-4 py-10 md:px-6">
      <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent)]">HUNTER NETWORK</p>
      <h1 className="font-display mt-2 text-4xl font-bold text-white md:text-5xl">
        Submit a FREE find
      </h1>
      <p className="mt-3 text-[var(--muted)]">
        Spot a real £0 opportunity? Send it in. We verify strong finds and add them to the board for
        every country.
      </p>
      <div className="mt-8">
        <SubmitOfferForm authed={!!session?.user} />
      </div>
    </div>
  );
}
