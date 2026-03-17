import type { Season, BranchRoute } from "./board";
import type { PlayerCharacter, NPCAffinity } from "./character";
import type { ResolvedEvent } from "./event";
import type {
  HappinessPillars,
  FluctuationState,
  HappinessChangeLog,
} from "./happiness";

export type GamePhase = "title" | "character_select" | "playing" | "result";
export type TurnPhase = "dice" | "move" | "event" | "settlement";

export interface GameState {
  phase: GamePhase;
  turnPhase: TurnPhase;
  currentTurn: number;
  totalTurns: number;
  currentSeason: Season;
  currentTileIndex: number;
  selectedRoute?: BranchRoute;
  player: PlayerCharacter;
  happiness: HappinessPillars;
  fluctuation: FluctuationState;
  affinities: NPCAffinity[];
  earnedTitles: string[];
  eventHistory: ResolvedEvent[];
  happinessLog: HappinessChangeLog[];
  activeChains: Record<string, number>;
  isFirstPlay: boolean;
  tutorialStep: number;
  seasonHighlights: SeasonHighlight[];
}

export interface SeasonHighlight {
  season: Season;
  event: ResolvedEvent;
  happinessSnapshot: HappinessPillars;
  description: string;
}

export function createInitialGameState(player: PlayerCharacter): GameState {
  return {
    phase: "playing",
    turnPhase: "dice",
    currentTurn: 1,
    totalTurns: 20,
    currentSeason: "spring",
    currentTileIndex: 0,
    player,
    happiness: { nature: 0, social: 0, creation: 0, money: 0, culture: 0 },
    fluctuation: { fatigue: 0, insight: 0 },
    affinities: [],
    earnedTitles: [],
    eventHistory: [],
    happinessLog: [],
    activeChains: {},
    isFirstPlay: true,
    tutorialStep: 0,
    seasonHighlights: [],
  };
}
