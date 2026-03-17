import type { Season, TileType } from "./board";
import type { HappinessPillars } from "./happiness";
import type { NPC } from "./character";

export type Weather = "sunny" | "rainy" | "snowy";

export interface EventChoice {
  id: string;
  text: string;
  requiredAffinity?: { npcId: string; minLevel: number };
  requiredTitle?: string;
  effects: EventEffect;
}

export interface EventEffect {
  happiness?: Partial<HappinessPillars>;
  fatigue?: number;
  insight?: number;
  affinity?: { npcId: string; change: number }[];
  romance?: { npcId: string; change: number };
  title?: string;
  chainNext?: string;
}

export interface EventTemplate {
  id: string;
  season: Season;
  baseTitle: string;
  baseDescription: string;
  tileTypes: TileType[];
  weatherVariants: Record<
    Weather,
    {
      titleSuffix?: string;
      descriptionOverride?: string;
      effectModifier?: Partial<EventEffect>;
    }
  >;
  npcVariants?: Record<
    string,
    {
      dialogueOverride?: string;
      effectModifier?: Partial<EventEffect>;
    }
  >;
  choices?: EventChoice[];
  isRare?: boolean;
  chainId?: string;
  chainStep?: number;
}

export interface ResolvedEvent {
  templateId: string;
  title: string;
  description: string;
  weather: Weather;
  npc?: NPC;
  choices: EventChoice[];
  effects: EventEffect;
}
