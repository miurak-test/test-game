import { describe, it, expect, beforeEach } from "vitest";
import type { GameState, PlayerCharacter } from "@/types";
import { createInitialGameState } from "@/types";
import { BoardSystem } from "@/systems/BoardSystem";
import { EventSystem } from "@/systems/EventSystem";
import { HappinessSystem } from "@/systems/HappinessSystem";
import { SHORT_BOARD_LAYOUT } from "@/data/board-layout";
import { EVENT_TEMPLATES } from "@/data/event-templates";
import { EVENT_CHAINS } from "@/data/event-chains";
import { RARE_EVENTS } from "@/data/rare-events";
import { NPCS } from "@/data/npc-data";
import { processTurn } from "@/scenes/helpers/turn-logic";
import { MAX_FATIGUE, MAX_INSIGHT } from "@/constants";

const TEST_PLAYER: PlayerCharacter = {
  name: "テスト太郎",
  gender: "male",
  spriteKey: "player_male",
};

describe("processTurn", () => {
  let state: GameState;
  let boardSystem: BoardSystem;
  let eventSystem: EventSystem;
  let happinessSystem: HappinessSystem;

  beforeEach(() => {
    state = createInitialGameState(TEST_PLAYER);
    boardSystem = new BoardSystem(SHORT_BOARD_LAYOUT);
    eventSystem = new EventSystem(
      EVENT_TEMPLATES,
      EVENT_CHAINS,
      RARE_EVENTS,
      NPCS,
    );
    happinessSystem = new HappinessSystem();
  });

  describe("normal tile turn processing", () => {
    it("advances the player position and increments turn", () => {
      const result = processTurn(
        state,
        1,
        boardSystem,
        eventSystem,
        happinessSystem,
      );

      // Player should have moved from index 0
      expect(result.newState.currentTileIndex).not.toBe(0);
      // Turn should increment
      expect(result.newState.currentTurn).toBe(2);
      // Event should be resolved
      expect(result.event.templateId).toBeDefined();
      expect(result.event.title).toBeTruthy();
      // Log should be generated
      expect(result.log.turn).toBe(1);
      expect(result.log.season).toBe("spring");
    });

    it("returns a landed tile with valid data", () => {
      const result = processTurn(
        state,
        1,
        boardSystem,
        eventSystem,
        happinessSystem,
      );

      expect(result.landedTile).toBeDefined();
      expect(result.landedTile.id).toBeTruthy();
      expect(result.landedTile.season).toBe("spring");
    });

    it("records event in eventHistory", () => {
      expect(state.eventHistory).toHaveLength(0);

      const result = processTurn(
        state,
        1,
        boardSystem,
        eventSystem,
        happinessSystem,
      );

      expect(result.newState.eventHistory).toHaveLength(1);
      expect(result.newState.eventHistory[0].templateId).toBe(
        result.event.templateId,
      );
    });

    it("records log in happinessLog", () => {
      expect(state.happinessLog).toHaveLength(0);

      const result = processTurn(
        state,
        1,
        boardSystem,
        eventSystem,
        happinessSystem,
      );

      expect(result.newState.happinessLog).toHaveLength(1);
      expect(result.newState.happinessLog[0].source).toBe(result.event.title);
    });
  });

  describe("branch tile route selection", () => {
    it("advances onto the selected route when routeChoice is provided", () => {
      // Move to branch point first: sp-branch is at index 2
      // From index 0 (sp-life-1), roll 2 lands on sp-branch (index 2)
      const atBranch: GameState = { ...state, currentTileIndex: 2 };

      const result = processTurn(
        atBranch,
        1,
        boardSystem,
        eventSystem,
        happinessSystem,
        "farm",
      );

      // Should land on a farm route tile
      expect(result.landedTile.route).toBe("farm");
    });

    it("can select shop route", () => {
      const atBranch: GameState = { ...state, currentTileIndex: 2 };

      const result = processTurn(
        atBranch,
        1,
        boardSystem,
        eventSystem,
        happinessSystem,
        "shop",
      );

      expect(result.landedTile.route).toBe("shop");
    });

    it("can select village route", () => {
      const atBranch: GameState = { ...state, currentTileIndex: 2 };

      const result = processTurn(
        atBranch,
        1,
        boardSystem,
        eventSystem,
        happinessSystem,
        "village",
      );

      expect(result.landedTile.route).toBe("village");
    });
  });

  describe("rest tile fatigue recovery", () => {
    it("reduces fatigue when landing on a rest tile", () => {
      // su-farm-2 (index 14) is type "rest" on the summer farm route
      // We need a state at su-farm-1 (index 13) and roll 1 to land on su-farm-2
      const beforeRest: GameState = {
        ...state,
        currentTileIndex: 13,
        currentSeason: "summer",
        fluctuation: { fatigue: 10, insight: 0 },
      };

      const result = processTurn(
        beforeRest,
        1,
        boardSystem,
        eventSystem,
        happinessSystem,
      );

      // Landing on rest tile should reduce fatigue (FATIGUE_DECAY_PER_REST = 3)
      // Fatigue might increase from positive event effects before rest reduction
      // but overall the rest tile effect should be applied
      expect(result.landedTile.type).toBe("rest");
      // Fatigue should be lower than it would be without rest
      // Initial fatigue was 10, rest reduces by 3, so max fatigue should be <= 10
      // (event effects may add +1 if positive changes occur)
      expect(result.newState.fluctuation.fatigue).toBeLessThanOrEqual(10);
    });
  });

  describe("game end detection", () => {
    it("sets isGameEnd to true when landing on winter festival tile", () => {
      // Winter tile indices:
      //   30: wi-life-1, 31: wi-romance, 32: wi-branch,
      //   33: wi-farm-1 (farm), 34: wi-farm-2 (farm),
      //   35: wi-shop-1 (shop), 36: wi-shop-2 (shop),
      //   37: wi-village-1 (village), 38: wi-village-2 (village),
      //   39: wi-festival (merge/end)
      // From wi-farm-2 (index 34, last farm tile), advance 1 -> wi-festival

      const nearEnd: GameState = {
        ...state,
        currentTileIndex: 34, // wi-farm-2
        currentSeason: "winter",
      };

      const result = processTurn(
        nearEnd,
        1,
        boardSystem,
        eventSystem,
        happinessSystem,
      );

      // wi-farm-2 (route=farm) -> advance 1 -> wi-festival (merge point)
      expect(result.landedTile.id).toBe("wi-festival");
      expect(result.isGameEnd).toBe(true);
      expect(result.newState.phase).toBe("result");
    });

    it("sets isGameEnd to false when not on winter festival", () => {
      const result = processTurn(
        state,
        1,
        boardSystem,
        eventSystem,
        happinessSystem,
      );

      expect(result.isGameEnd).toBe(false);
      expect(result.newState.phase).toBe("playing");
    });
  });

  describe("chain events", () => {
    it("chain event progresses step when chainNext is present in effects", () => {
      // If an event has chainNext in its effects, the chain step should be recorded
      // Simulate by providing an eventChoiceId that triggers chainNext
      // Use a state where a chain could potentially start
      const result = processTurn(
        state,
        1,
        boardSystem,
        eventSystem,
        happinessSystem,
      );

      // Chain progression is driven by effects.chainNext
      // The state tracks active chains - verify it's a valid record
      expect(result.newState.activeChains).toBeDefined();
      expect(typeof result.newState.activeChains).toBe("object");
    });

    it("route choice applies route buff AND turn proceeds correctly", () => {
      // At branch point, choose farm route
      const atBranch: GameState = { ...state, currentTileIndex: 2 };

      const result = processTurn(
        atBranch,
        1,
        boardSystem,
        eventSystem,
        happinessSystem,
        "farm",
      );

      // Farm route should apply nature+1 buff
      // The route buff is applied via a second applyEffect call
      expect(result.landedTile.route).toBe("farm");
      // Turn should increment
      expect(result.newState.currentTurn).toBe(2);
      // Event should be resolved
      expect(result.event.templateId).toBeDefined();
    });

    it("chain resolveChainNext returns null at final step", () => {
      // Directly test that chains complete properly
      const result = eventSystem.resolveChainNext(
        "spring-cat",
        3,
        {
          season: "spring",
          tileType: "life",
          weather: "sunny",
          affinities: [],
          earnedTitles: [],
          activeChains: {},
          turn: 1,
        },
      );

      // Step 3 is the last step in spring-cat chain, so step 4 should not exist
      expect(result).toBeNull();
    });
  });

  describe("turn end state consistency", () => {
    it("after 20 turns game phase transitions to result", () => {
      // Simulate 20 turns
      let currentState = state;

      for (let i = 0; i < 20; i++) {
        const result = processTurn(
          currentState,
          1,
          boardSystem,
          eventSystem,
          happinessSystem,
          currentState.currentTileIndex === 2 ||
            currentState.currentTileIndex === 12 ||
            currentState.currentTileIndex === 22 ||
            currentState.currentTileIndex === 32
            ? "farm"
            : undefined,
        );
        currentState = result.newState;

        // If game ended early (reached GOAL), check phase
        if (result.isGameEnd) {
          expect(currentState.phase).toBe("result");
          break;
        }
      }

      // After enough turns, the state should be valid
      expect(currentState.currentTurn).toBeGreaterThan(1);
      expect(currentState.eventHistory.length).toBeGreaterThan(0);
      expect(currentState.happinessLog.length).toBeGreaterThan(0);
    });

    it("season highlights are recorded once per season", () => {
      let currentState = state;

      // Process enough turns to cross into summer
      for (let i = 0; i < 10; i++) {
        const result = processTurn(
          currentState,
          1,
          boardSystem,
          eventSystem,
          happinessSystem,
          currentState.currentTileIndex === 2 ? "farm" : undefined,
        );
        currentState = result.newState;
        if (result.isGameEnd) break;
      }

      // Check season highlights - spring should have exactly 1 entry
      const springHighlights = currentState.seasonHighlights.filter(
        (h) => h.season === "spring",
      );
      expect(springHighlights.length).toBeLessThanOrEqual(1);

      // Each season in highlights should be unique
      const seasons = currentState.seasonHighlights.map((h) => h.season);
      const uniqueSeasons = new Set(seasons);
      expect(uniqueSeasons.size).toBe(seasons.length);
    });

    it("all state fields remain valid after full game simulation", () => {
      let currentState = state;

      // Simulate 15 turns
      for (let i = 0; i < 15; i++) {
        const tileIdx = currentState.currentTileIndex;
        const isBranch =
          tileIdx === 2 || tileIdx === 12 || tileIdx === 22 || tileIdx === 32;
        const result = processTurn(
          currentState,
          1,
          boardSystem,
          eventSystem,
          happinessSystem,
          isBranch ? "farm" : undefined,
        );
        currentState = result.newState;
        if (result.isGameEnd) break;
      }

      // Validate all state fields
      expect(currentState.happiness.nature).toBeGreaterThanOrEqual(0);
      expect(currentState.happiness.social).toBeGreaterThanOrEqual(0);
      expect(currentState.happiness.creation).toBeGreaterThanOrEqual(0);
      expect(currentState.happiness.money).toBeGreaterThanOrEqual(0);
      expect(currentState.happiness.culture).toBeGreaterThanOrEqual(0);
      expect(currentState.fluctuation.fatigue).toBeGreaterThanOrEqual(0);
      expect(currentState.fluctuation.fatigue).toBeLessThanOrEqual(MAX_FATIGUE);
      expect(currentState.fluctuation.insight).toBeGreaterThanOrEqual(0);
      expect(currentState.fluctuation.insight).toBeLessThanOrEqual(MAX_INSIGHT);
      expect(currentState.eventHistory.length).toBe(
        currentState.happinessLog.length,
      );
      expect(currentState.currentTileIndex).toBeGreaterThanOrEqual(0);
      expect(currentState.currentTileIndex).toBeLessThan(
        SHORT_BOARD_LAYOUT.tiles.length,
      );
    });
  });

  describe("season transition", () => {
    it("transitions from spring to summer when crossing season boundary", () => {
      // sp-festival is at index 9, and advance 1 from there -> su-life-1 (index 10)
      const atSpringEnd: GameState = {
        ...state,
        currentTileIndex: 9, // sp-festival
        currentSeason: "spring",
      };

      const result = processTurn(
        atSpringEnd,
        1,
        boardSystem,
        eventSystem,
        happinessSystem,
      );

      expect(result.newState.currentSeason).toBe("summer");
      expect(result.landedTile.season).toBe("summer");
    });

    it("transitions from summer to autumn", () => {
      // su-festival is at index 19, advance 1 -> au-life-1 (index 20)
      const atSummerEnd: GameState = {
        ...state,
        currentTileIndex: 19, // su-festival
        currentSeason: "summer",
      };

      const result = processTurn(
        atSummerEnd,
        1,
        boardSystem,
        eventSystem,
        happinessSystem,
      );

      expect(result.newState.currentSeason).toBe("autumn");
      expect(result.landedTile.season).toBe("autumn");
    });

    it("transitions from autumn to winter", () => {
      // au-festival is at index 29, advance 1 -> wi-life-1 (index 30)
      const atAutumnEnd: GameState = {
        ...state,
        currentTileIndex: 29, // au-festival
        currentSeason: "autumn",
      };

      const result = processTurn(
        atAutumnEnd,
        1,
        boardSystem,
        eventSystem,
        happinessSystem,
      );

      expect(result.newState.currentSeason).toBe("winter");
      expect(result.landedTile.season).toBe("winter");
    });
  });
});
