import type { HappinessPillar } from "./happiness";

export interface TitleDefinition {
  id: string;
  name: string;
  description: string;
  condition: TitleCondition;
  unlocksEvents?: string[];
}

export type TitleCondition =
  | { type: "pillar_threshold"; pillar: HappinessPillar; min: number }
  | { type: "axis_balance"; minEach: number }
  | { type: "affinity_threshold"; npcId: string; min: number }
  | { type: "affinity_count"; minLevel: number; count: number }
  | { type: "event_count"; count: number }
  | { type: "specific_event"; eventId: string };
