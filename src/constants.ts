import type {
  Season,
  Weather,
  BranchRoute,
  HappinessPillars,
} from "./types";

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const COLORS = {
  BACKGROUND: 0x2d2d2d,
  WHITE: 0xffffff,
  BLACK: 0x000000,
  PRIMARY: 0x4a90d9,
  SECONDARY: 0x7ec850,
  ACCENT: 0xf5a623,
} as const;

export const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];
export const WEATHER_TYPES: Weather[] = ["sunny", "rainy", "snowy"];
export const BRANCH_ROUTES: BranchRoute[] = ["farm", "shop", "village"];
export const SHORT_MODE_TURNS = 20;
export const FATIGUE_DECAY_PER_REST = 3;
export const INSIGHT_BONUS_THRESHOLD = 5;

export const ROUTE_BUFFS: Record<BranchRoute, Partial<HappinessPillars>> = {
  farm: { nature: 1 },
  shop: { money: 1 },
  village: { culture: 1 },
};

export const ROUTE_SPECIAL: Record<
  BranchRoute,
  { fatigueMod: number; insightMod: number }
> = {
  farm: { fatigueMod: -2, insightMod: 0 },
  shop: { fatigueMod: 0, insightMod: 0 },
  village: { fatigueMod: 0, insightMod: 2 },
};
