import { describe, it, expect } from "vitest";
import { createInitialGameState } from "@/types/game-state";
import type { PlayerCharacter } from "@/types/character";

describe("createInitialGameState", () => {
  const player: PlayerCharacter = {
    name: "テスト太郎",
    gender: "male",
    spriteKey: "player_male",
  };

  it("全 happiness pillar が 0 で初期化される", () => {
    const state = createInitialGameState(player);

    expect(state.happiness).toEqual({
      nature: 0,
      social: 0,
      creation: 0,
      money: 0,
      culture: 0,
    });
  });

  it("fatigue と insight が 0 で初期化される", () => {
    const state = createInitialGameState(player);

    expect(state.fluctuation.fatigue).toBe(0);
    expect(state.fluctuation.insight).toBe(0);
  });

  it("currentTurn が 1 で初期化される", () => {
    const state = createInitialGameState(player);

    expect(state.currentTurn).toBe(1);
  });

  it("totalTurns が 20 で初期化される", () => {
    const state = createInitialGameState(player);

    expect(state.totalTurns).toBe(20);
  });

  it("currentSeason が spring で初期化される", () => {
    const state = createInitialGameState(player);

    expect(state.currentSeason).toBe("spring");
  });

  it("isFirstPlay が true で初期化される", () => {
    const state = createInitialGameState(player);

    expect(state.isFirstPlay).toBe(true);
  });

  it("earnedTitles が空配列で初期化される", () => {
    const state = createInitialGameState(player);

    expect(state.earnedTitles).toEqual([]);
  });

  it("affinities が空配列で初期化される", () => {
    const state = createInitialGameState(player);

    expect(state.affinities).toEqual([]);
  });

  it("phase が playing で初期化される", () => {
    const state = createInitialGameState(player);

    expect(state.phase).toBe("playing");
  });

  it("turnPhase が dice で初期化される", () => {
    const state = createInitialGameState(player);

    expect(state.turnPhase).toBe("dice");
  });

  it("player が渡された値と一致する", () => {
    const state = createInitialGameState(player);

    expect(state.player).toEqual(player);
  });

  it("eventHistory が空配列で初期化される", () => {
    const state = createInitialGameState(player);

    expect(state.eventHistory).toEqual([]);
  });

  it("happinessLog が空配列で初期化される", () => {
    const state = createInitialGameState(player);

    expect(state.happinessLog).toEqual([]);
  });

  it("activeChains が空オブジェクトで初期化される", () => {
    const state = createInitialGameState(player);

    expect(state.activeChains).toEqual({});
  });

  it("tutorialStep が 0 で初期化される", () => {
    const state = createInitialGameState(player);

    expect(state.tutorialStep).toBe(0);
  });

  it("currentTileIndex が 0 で初期化される", () => {
    const state = createInitialGameState(player);

    expect(state.currentTileIndex).toBe(0);
  });

  it("seasonHighlights が空配列で初期化される", () => {
    const state = createInitialGameState(player);

    expect(state.seasonHighlights).toEqual([]);
  });

  it("selectedRoute が undefined で初期化される", () => {
    const state = createInitialGameState(player);

    expect(state.selectedRoute).toBeUndefined();
  });
});
