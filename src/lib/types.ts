export type SignalCategory =
  | "get"
  | "go"
  | "eat"
  | "learn"
  | "play"
  | "try"
  | "kids"
  | "online";

export type VerificationLevel = "verified" | "community" | "exclusive";

export type ScoreLabel = "EXCEPTIONAL FREEBIE" | "GOOD SIGNAL" | "LOW CONFIDENCE";

export interface FreeSignal {
  id: string;
  title: string;
  summary: string;
  category: SignalCategory;
  subcategory: string;
  location: string;
  country: string;
  distanceMiles?: number;
  freeScore: number;
  normalValue: number;
  claims: number;
  watching: number;
  remaining?: number;
  successRate: number;
  verifiedMinsAgo: number;
  requiresCard: boolean;
  cancelReminder: boolean;
  verification: VerificationLevel;
  status: "live" | "ending" | "new";
  endsInHours?: number;
  droppedMinsAgo?: number;
  activityDelta?: number;
  city: string;
  workedFor: number;
  didntWork: number;
  updates: { time: string; text: string }[];
  tags: string[];
  sponsored?: boolean;
  claimUrl?: string;
  claimPhone?: string;
  claimEmail?: string;
  howToClaim?: string;
}

export interface CreatorDrop {
  id: string;
  title: string;
  brand: string;
  retailValue: number;
  available: number;
  applied: number;
  selected: number;
  closesInHours: number;
  matchScore: number;
  requirements: string[];
  missionType: string;
  category: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  minsAgo: number;
}

export interface CityHeat {
  city: string;
  level: number;
  label: "HOT" | "WARM" | "STEADY";
  newSignals: number;
}

export interface PulseMetrics {
  liveFreebies: number;
  valueAvailable: number;
  claimsToday: number;
  newToday: number;
  endingSoon: number;
  verifiedPct: number;
  peopleWatching: number;
}
