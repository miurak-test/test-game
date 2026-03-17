import type { Season } from "./board";

export type HappinessPillar =
  | "nature"
  | "social"
  | "creation"
  | "money"
  | "culture";
export type HappinessAxis = "kurashi" | "tsunagari" | "jibun";

export interface HappinessPillars {
  nature: number;
  social: number;
  creation: number;
  money: number;
  culture: number;
}

export interface HappinessAxes {
  kurashi: number; // nature + money
  tsunagari: number; // social
  jibun: number; // creation + culture
}

export interface FluctuationState {
  fatigue: number; // 0-100
  insight: number; // 0-100
}

export interface HappinessChangeLog {
  turn: number;
  season: Season;
  source: string;
  rawChanges: Partial<HappinessPillars>;
  fatigueEffect: number;
  insightEffect: number;
  finalChanges: Partial<HappinessPillars>;
}
