import type { Season } from "./board";
import type { NPCAffinity } from "./character";

export interface RomanceState {
  affinities: NPCAffinity[];
  seasonHighlights: RomanceHighlight[];
}

export interface RomanceHighlight {
  season: Season;
  npcId: string;
  eventId: string;
  description: string;
}
