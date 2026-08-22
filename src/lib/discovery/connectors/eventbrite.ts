import type { RawCandidate } from "@/lib/discovery/types";
import { UK_DISCOVERY_CITIES } from "@/lib/discovery/types";
import { inferCategory } from "@/lib/discovery/verify-offer";

type EventbriteEvent = {
  id: string;
  name?: { text?: string };
  description?: { text?: string };
  url?: string;
  is_free?: boolean;
  online_event?: boolean;
};

type EventbriteSearch = {
  events?: EventbriteEvent[];
};

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 480);
}

export async function fetchEventbriteCandidates(): Promise<RawCandidate[]> {
  const token = process.env.EVENTBRITE_API_TOKEN;
  if (!token) return [];

  const out: RawCandidate[] = [];
  const seen = new Set<string>();

  for (const city of UK_DISCOVERY_CITIES) {
    const params = new URLSearchParams({
      q: "free",
      "location.address": `${city}, UK`,
      "location.within": "40km",
      price: "free",
      expand: "venue",
      sort_by: "date",
    });

    try {
      const res = await fetch(`https://www.eventbriteapi.com/v3/events/search/?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 0 },
      });
      if (!res.ok) continue;

      const data = (await res.json()) as EventbriteSearch;
      for (const event of data.events ?? []) {
        if (!event.id || seen.has(event.id)) continue;
        seen.add(event.id);

        const title = event.name?.text?.trim();
        const claimUrl = event.url?.trim();
        if (!title || !claimUrl) continue;

        const summary = stripHtml(event.description?.text || "") || `Free event in ${city}. Book on Eventbrite.`;
        out.push({
          source: "eventbrite",
          externalId: event.id,
          title: title.slice(0, 120),
          summary,
          category: inferCategory(`${title} ${summary}`),
          country: "GB",
          city,
          location: event.online_event ? "Online" : `${city}, GB`,
          claimUrl,
          howToClaim: `1. Open the Eventbrite page.\n2. Reserve a free ticket if available.\n3. Bring your ticket QR code or email confirmation.`,
          normalValue: event.is_free ? 15 : 10,
        });
      }
    } catch {
      // try next city
    }
  }

  return out;
}
