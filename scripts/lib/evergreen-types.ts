export type SignalCategory =
  | "GET"
  | "GO"
  | "EAT"
  | "LEARN"
  | "PLAY"
  | "TRY"
  | "KIDS"
  | "ONLINE";

export type SourceType = "OFFICIAL" | "CURATED" | "COMMUNITY";
export type Verification = "VERIFIED" | "COMMUNITY";

/** Raw venue / programme row used to build evergreen offers. */
export type EvergreenSource = {
  title: string;
  city: string;
  country: string;
  claimUrl: string | null;
  subcategory: string;
  normalValue: number;
  summary: string;
  category?: SignalCategory;
  tags?: string[];
  requiresCard?: boolean;
  cancelReminder?: boolean;
  sourceName?: string;
  sourceType?: SourceType;
  verification?: Verification;
  freeScore?: number;
};

export type EvergreenOffer = {
  slug: string;
  title: string;
  summary: string;
  category: SignalCategory;
  subcategory: string;
  location: string;
  city: string;
  country: string;
  freeScore: number;
  normalValue: number;
  requiresCard: boolean;
  cancelReminder: boolean;
  verification: Verification;
  tags: string[];
  claimUrl: string | null;
  sourceName: string;
  sourceType: SourceType;
  evergreen: true;
};
