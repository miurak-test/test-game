import type {
  GameState,
  ResolvedEvent,
  HappinessChangeLog,
  BranchRoute,
  Tile,
} from "@/types";
import type { EventContext } from "@/systems/EventSystem";
import { BoardSystem } from "@/systems/BoardSystem";
import { EventSystem } from "@/systems/EventSystem";
import { HappinessSystem } from "@/systems/HappinessSystem";
import { NPCS } from "@/data/npc-data";

export interface TurnResult {
  newState: GameState;
  event: ResolvedEvent;
  log: HappinessChangeLog;
  landedTile: Tile;
  isGameEnd: boolean;
}

/**
 * Process a single turn as a pure function.
 *
 * Steps:
 *   1. Roll dice and advance on the board
 *   2. Resolve event for the landed tile
 *   3. Apply event effects and route buffs via HappinessSystem
 *   4. Handle rest tiles (fatigue recovery)
 *   5. Check game-end condition
 */
export function processTurn(
  state: GameState,
  diceRoll: number,
  boardSystem: BoardSystem,
  eventSystem: EventSystem,
  happinessSystem: HappinessSystem,
  routeChoice?: BranchRoute,
  eventChoiceId?: string,
): TurnResult {
  // 1. Advance on the board
  const currentTileId = getTileIdByIndex(state, boardSystem);
  const landedTile = boardSystem.advance(currentTileId, diceRoll, routeChoice);

  // 2. Determine weather and build event context
  const season = boardSystem.getCurrentSeason(landedTile.id);
  const weather = EventSystem.determineWeather(season);
  const randomNpc =
    NPCS.length > 0 ? NPCS[Math.floor(Math.random() * NPCS.length)] : undefined;

  const context: EventContext = {
    season,
    tileType: landedTile.type,
    weather,
    currentNpc: randomNpc,
    affinities: state.affinities,
    earnedTitles: state.earnedTitles,
    activeChains: state.activeChains,
    turn: state.currentTurn,
  };

  // 3. Resolve event (check rare first, then chain, then normal)
  let event = eventSystem.checkRareEvent(context);
  if (!event) {
    event = eventSystem.resolveEvent(context);
  }

  // Apply chosen choice effects if specified
  let chosenEffects = event.effects;
  if (eventChoiceId && event.choices.length > 0) {
    const chosenChoice = event.choices.find((c) => c.id === eventChoiceId);
    if (chosenChoice) {
      chosenEffects = {
        ...event.effects,
        happiness: {
          ...(event.effects.happiness ?? {}),
          ...(chosenChoice.effects.happiness ?? {}),
        },
        fatigue:
          (event.effects.fatigue ?? 0) + (chosenChoice.effects.fatigue ?? 0),
        insight:
          (event.effects.insight ?? 0) + (chosenChoice.effects.insight ?? 0),
      };
      // Merge chain info
      if (chosenChoice.effects.chainNext) {
        chosenEffects.chainNext = chosenChoice.effects.chainNext;
      }
      if (chosenChoice.effects.title) {
        chosenEffects.title = chosenChoice.effects.title;
      }
    }
  }

  // 4. Apply happiness changes
  const rawHappiness = chosenEffects.happiness ?? {};
  const { newState: happinessResult, log } = happinessSystem.applyEffect(
    { happiness: { ...state.happiness }, fluctuation: { ...state.fluctuation } },
    rawHappiness,
    event.title,
    state.currentTurn,
    season,
  );

  // Apply route buff
  const routeBuff = boardSystem.getRouteBuff(landedTile.id);
  let { happiness, fluctuation } = happinessResult;

  if (Object.keys(routeBuff.happiness).length > 0) {
    const routeResult = happinessSystem.applyEffect(
      { happiness, fluctuation },
      routeBuff.happiness,
      `route-buff-${landedTile.route}`,
      state.currentTurn,
      season,
    );
    happiness = routeResult.newState.happiness;
    fluctuation = routeResult.newState.fluctuation;
  }

  // Apply fatigue/insight modifiers from event and route
  fluctuation = {
    fatigue: Math.max(
      0,
      Math.min(
        100,
        fluctuation.fatigue +
          (chosenEffects.fatigue ?? 0) +
          routeBuff.fatigueMod,
      ),
    ),
    insight: Math.max(
      0,
      Math.min(
        100,
        fluctuation.insight +
          (chosenEffects.insight ?? 0) +
          routeBuff.insightMod,
      ),
    ),
  };

  // 5. Handle rest tile
  if (landedTile.type === "rest") {
    fluctuation = happinessSystem.applyRest(fluctuation);
  }

  // 6. Build new state
  const newState: GameState = {
    ...state,
    currentTileIndex: landedTile.index,
    currentSeason: season,
    happiness,
    fluctuation,
    currentTurn: state.currentTurn + 1,
    eventHistory: [...state.eventHistory, event],
    happinessLog: [...state.happinessLog, log],
    selectedRoute: routeChoice ?? state.selectedRoute,
  };

  // Handle chain progression
  if (chosenEffects.chainNext) {
    const chainId = event.templateId.replace(/-\d+$/, "");
    const currentStep =
      state.activeChains[chainId] !== undefined
        ? state.activeChains[chainId]
        : 0;
    newState.activeChains = {
      ...newState.activeChains,
      [chainId]: currentStep + 1,
    };
  }

  // Handle title earning
  if (chosenEffects.title && !state.earnedTitles.includes(chosenEffects.title)) {
    newState.earnedTitles = [...newState.earnedTitles, chosenEffects.title];
  }

  // Handle affinity changes
  if (chosenEffects.affinity) {
    const affinities = [...state.affinities];
    for (const change of chosenEffects.affinity) {
      const existing = affinities.find((a) => a.npcId === change.npcId);
      if (existing) {
        existing.level = Math.min(100, Math.max(0, existing.level + change.change));
      } else {
        affinities.push({
          npcId: change.npcId,
          level: Math.max(0, change.change),
          romanceLevel: 0,
        });
      }
    }
    newState.affinities = affinities;
  }

  // Handle season highlights - record one per season
  const existingHighlight = state.seasonHighlights.find(
    (h) => h.season === season,
  );
  if (!existingHighlight) {
    newState.seasonHighlights = [
      ...state.seasonHighlights,
      {
        season,
        event,
        happinessSnapshot: { ...happiness },
        description: event.title,
      },
    ];
  }

  // 7. Check game end
  const isGameEnd = boardSystem.isGameEnd(landedTile.id);
  if (isGameEnd) {
    newState.phase = "result";
  }

  return { newState, event, log, landedTile, isGameEnd };
}

/** Get the tile ID corresponding to the current tile index in GameState */
function getTileIdByIndex(state: GameState, boardSystem: BoardSystem): string {
  const layout = (boardSystem as unknown as { layout: { tiles: Tile[] } }).layout;
  const tile = layout.tiles[state.currentTileIndex];
  if (!tile) {
    throw new Error(`Tile not found at index: ${state.currentTileIndex}`);
  }
  return tile.id;
}
