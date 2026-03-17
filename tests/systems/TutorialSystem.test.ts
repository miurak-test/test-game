import { describe, it, expect } from "vitest";
import { TutorialSystem } from "@/systems/TutorialSystem";
import type { GameState, ResolvedEvent } from "@/types";
import { createInitialGameState } from "@/types";

const makeGameState = (
  overrides: Partial<GameState> = {},
): GameState => ({
  ...createInitialGameState({ name: "Test", gender: "male", spriteKey: "test" }),
  ...overrides,
});

const makeEvent = (
  templateId: string,
  hasPositiveEffect = false,
  hasNegativeEffect = false,
): ResolvedEvent => ({
  templateId,
  title: "Test",
  description: "Test",
  weather: "sunny",
  choices: [],
  effects: {
    happiness: {
      ...(hasPositiveEffect ? { nature: 3 } : {}),
      ...(hasNegativeEffect ? { social: -2 } : {}),
    },
  },
});

describe("TutorialSystem", () => {
  describe("checkTrigger", () => {
    it("returns welcome step on turn 1", () => {
      const tutorial = new TutorialSystem(true);
      const state = makeGameState({ currentTurn: 1 });

      const step = tutorial.checkTrigger(state);

      expect(step).not.toBeNull();
      expect(step!.id).toBe("welcome");
      expect(step!.message).toContain("サイコロを振って");
    });

    it("returns fatigue_intro on first positive event", () => {
      const tutorial = new TutorialSystem(true);
      // Complete welcome step first
      tutorial.completeStep("welcome");

      const state = makeGameState({ currentTurn: 2 });
      const positiveEvent = makeEvent("evt1", true, false);

      const step = tutorial.checkTrigger(state, positiveEvent);

      expect(step).not.toBeNull();
      expect(step!.id).toBe("fatigue_intro");
      expect(step!.message).toContain("疲労");
    });

    it("returns insight_intro on first negative event", () => {
      const tutorial = new TutorialSystem(true);
      tutorial.completeStep("welcome");
      tutorial.completeStep("fatigue_intro");

      const state = makeGameState({ currentTurn: 3 });
      const negativeEvent = makeEvent("evt2", false, true);

      const step = tutorial.checkTrigger(state, negativeEvent);

      expect(step).not.toBeNull();
      expect(step!.id).toBe("insight_intro");
      expect(step!.message).toContain("洞察");
    });

    it("returns branch_intro on first branch", () => {
      const tutorial = new TutorialSystem(true);
      tutorial.completeStep("welcome");
      tutorial.completeStep("fatigue_intro");
      tutorial.completeStep("insight_intro");

      const state = makeGameState({
        currentTurn: 4,
        turnPhase: "move",
      });

      const step = tutorial.checkTrigger(state, undefined, true);

      expect(step).not.toBeNull();
      expect(step!.id).toBe("branch_intro");
      expect(step!.message).toContain("分岐");
    });

    it("returns fatigue_warning when fatigue reaches threshold", () => {
      const tutorial = new TutorialSystem(true);
      tutorial.completeStep("welcome");
      tutorial.completeStep("fatigue_intro");
      tutorial.completeStep("insight_intro");
      tutorial.completeStep("branch_intro");

      const state = makeGameState({
        currentTurn: 5,
        fluctuation: { fatigue: 3, insight: 0 },
      });

      const step = tutorial.checkTrigger(state);

      expect(step).not.toBeNull();
      expect(step!.id).toBe("fatigue_warning");
      expect(step!.message).toContain("疲労がたまってきた");
    });
  });

  describe("completeStep", () => {
    it("prevents completed steps from triggering again", () => {
      const tutorial = new TutorialSystem(true);
      const state = makeGameState({ currentTurn: 1 });

      // First trigger
      const step1 = tutorial.checkTrigger(state);
      expect(step1).not.toBeNull();
      expect(step1!.id).toBe("welcome");

      // Complete it
      tutorial.completeStep("welcome");

      // Should not trigger again
      const step2 = tutorial.checkTrigger(state);
      expect(step2?.id).not.toBe("welcome");
    });
  });

  describe("isFirstPlay false", () => {
    it("checkTrigger always returns null when not first play", () => {
      const tutorial = new TutorialSystem(false);
      const state = makeGameState({ currentTurn: 1 });

      expect(tutorial.checkTrigger(state)).toBeNull();

      const positiveEvent = makeEvent("evt1", true, false);
      expect(tutorial.checkTrigger(state, positiveEvent)).toBeNull();
    });
  });

  describe("isComplete", () => {
    it("returns true when all steps are completed", () => {
      const tutorial = new TutorialSystem(true);

      expect(tutorial.isComplete()).toBe(false);

      tutorial.completeStep("welcome");
      tutorial.completeStep("fatigue_intro");
      tutorial.completeStep("insight_intro");
      tutorial.completeStep("branch_intro");
      tutorial.completeStep("fatigue_warning");

      expect(tutorial.isComplete()).toBe(true);
    });
  });
});
