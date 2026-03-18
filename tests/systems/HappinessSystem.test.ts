import { describe, it, expect, beforeEach } from "vitest";
import { HappinessSystem } from "@/systems/HappinessSystem";
import { MAX_FATIGUE, MAX_INSIGHT } from "@/constants";
import type { HappinessPillars, FluctuationState } from "@/types";

describe("HappinessSystem", () => {
  describe("toAxes", () => {
    it("5 pillar to 3 axes conversion", () => {
      const pillars: HappinessPillars = {
        nature: 3,
        social: 5,
        creation: 2,
        money: 4,
        culture: 1,
      };
      const axes = HappinessSystem.toAxes(pillars);
      expect(axes).toEqual({
        kurashi: 7, // nature(3) + money(4)
        tsunagari: 5, // social(5)
        jibun: 3, // creation(2) + culture(1)
      });
    });
  });

  describe("applyEffect", () => {
    let system: HappinessSystem;

    beforeEach(() => {
      system = new HappinessSystem();
    });

    it("positive changes applied without attenuation when fatigue is 0", () => {
      const state = {
        happiness: { nature: 5, social: 3, creation: 2, money: 4, culture: 1 },
        fluctuation: { fatigue: 0, insight: 0 },
      };
      const rawChanges: Partial<HappinessPillars> = { nature: 3, social: 2 };

      const { newState, log } = system.applyEffect(
        state,
        rawChanges,
        "test-event",
        1,
        "spring",
      );

      expect(newState.happiness.nature).toBe(8); // 5 + 3
      expect(newState.happiness.social).toBe(5); // 3 + 2
      expect(newState.happiness.creation).toBe(2); // unchanged
      expect(newState.fluctuation.fatigue).toBe(1); // positive change increments fatigue
      expect(log.source).toBe("test-event");
      expect(log.turn).toBe(1);
      expect(log.season).toBe("spring");
    });

    it("positive changes attenuated when fatigue >= 3", () => {
      const state = {
        happiness: { nature: 5, social: 3, creation: 2, money: 4, culture: 1 },
        fluctuation: { fatigue: 6, insight: 0 },
      };
      const rawChanges: Partial<HappinessPillars> = { nature: 3, social: 2 };

      const { newState, log } = system.applyEffect(
        state,
        rawChanges,
        "test-event",
        2,
        "spring",
      );

      // fatigue=6, floor(6/3)=2 attenuation
      // nature: max(0, 3 - 2) = 1, social: max(0, 2 - 2) = 0
      expect(newState.happiness.nature).toBe(6); // 5 + 1
      expect(newState.happiness.social).toBe(3); // 3 + 0
      expect(newState.fluctuation.fatigue).toBe(7); // 6 + 1 (positive changes exist)
      expect(log.fatigueEffect).toBe(-2); // attenuation amount
    });

    it("negative changes accumulate insight", () => {
      const state = {
        happiness: { nature: 5, social: 3, creation: 2, money: 4, culture: 1 },
        fluctuation: { fatigue: 0, insight: 0 },
      };
      const rawChanges: Partial<HappinessPillars> = { nature: -2 };

      const { newState } = system.applyEffect(
        state,
        rawChanges,
        "test-event",
        3,
        "summer",
      );

      expect(newState.happiness.nature).toBe(3); // 5 - 2
      expect(newState.fluctuation.insight).toBe(1); // negative change increments insight
      expect(newState.fluctuation.fatigue).toBe(0); // no positive changes, no fatigue
    });

    it("insight >= 5 gives bonus to creation and culture", () => {
      const state = {
        happiness: { nature: 5, social: 3, creation: 2, money: 4, culture: 1 },
        fluctuation: { fatigue: 0, insight: 5 },
      };
      const rawChanges: Partial<HappinessPillars> = { nature: 1 };

      const { newState, log } = system.applyEffect(
        state,
        rawChanges,
        "test-event",
        4,
        "autumn",
      );

      // insight=5, floor(5/5)=1 bonus to creation and culture
      expect(newState.happiness.nature).toBe(6); // 5 + 1
      expect(newState.happiness.creation).toBe(3); // 2 + 1 (insight bonus)
      expect(newState.happiness.culture).toBe(2); // 1 + 1 (insight bonus)
      expect(log.insightEffect).toBe(1);
    });

    it("happiness pillar does not go below 0", () => {
      const state = {
        happiness: { nature: 1, social: 0, creation: 0, money: 0, culture: 0 },
        fluctuation: { fatigue: 0, insight: 0 },
      };
      const rawChanges: Partial<HappinessPillars> = { nature: -5 };

      const { newState } = system.applyEffect(
        state,
        rawChanges,
        "test-event",
        5,
        "winter",
      );

      expect(newState.happiness.nature).toBe(0); // clamped to 0
    });

    it("fatigue at MAX + positive event applies maximum attenuation", () => {
      const state = {
        happiness: { nature: 10, social: 10, creation: 10, money: 10, culture: 10 },
        fluctuation: { fatigue: MAX_FATIGUE, insight: 0 },
      };
      const rawChanges: Partial<HappinessPillars> = { nature: 5 };

      const { newState, log } = system.applyEffect(
        state,
        rawChanges,
        "test-max-fatigue",
        6,
        "spring",
      );

      // fatigue=MAX_FATIGUE(10), floor(10/3)=3 attenuation
      // nature: max(0, 5 - 3) = 2
      expect(newState.happiness.nature).toBe(12); // 10 + 2
      expect(log.fatigueEffect).toBe(-3);
      // fatigue stays at MAX (10 + 1 would be 11 but capped to MAX_FATIGUE)
      expect(newState.fluctuation.fatigue).toBe(MAX_FATIGUE);
    });

    it("insight at MAX + negative event caps insight at MAX_INSIGHT", () => {
      const state = {
        happiness: { nature: 10, social: 10, creation: 10, money: 10, culture: 10 },
        fluctuation: { fatigue: 0, insight: MAX_INSIGHT },
      };
      const rawChanges: Partial<HappinessPillars> = { nature: -1 };

      const { newState, log } = system.applyEffect(
        state,
        rawChanges,
        "test-max-insight",
        7,
        "summer",
      );

      // insight=MAX_INSIGHT(10), floor(10/5)=2 bonus to creation and culture
      expect(log.insightEffect).toBe(2);
      expect(newState.happiness.creation).toBe(12); // 10 + 2
      expect(newState.happiness.culture).toBe(12); // 10 + 2
      // insight stays at MAX (10 + 1 would be 11 but capped to MAX_INSIGHT)
      expect(newState.fluctuation.insight).toBe(MAX_INSIGHT);
    });

    it("fatigue high + insight high simultaneously applies both effects", () => {
      const state = {
        happiness: { nature: 10, social: 10, creation: 10, money: 10, culture: 10 },
        fluctuation: { fatigue: 9, insight: 10 },
      };
      // Both positive and negative changes
      const rawChanges: Partial<HappinessPillars> = { nature: 5, social: -1 };

      const { newState, log } = system.applyEffect(
        state,
        rawChanges,
        "test-both",
        8,
        "autumn",
      );

      // fatigue=9, floor(9/3)=3 attenuation on positive
      // insight=10, floor(10/5)=2 bonus on creation/culture
      // nature: max(0, 5 - 3) = 2 -> 10 + 2 = 12
      // social: -1 (negative, no attenuation) -> 10 - 1 = 9
      // creation: 0 + 2 (insight bonus) = 2 -> 10 + 2 = 12
      // culture: 0 + 2 (insight bonus) = 2 -> 10 + 2 = 12
      expect(newState.happiness.nature).toBe(12);
      expect(newState.happiness.social).toBe(9);
      expect(newState.happiness.creation).toBe(12);
      expect(newState.happiness.culture).toBe(12);
      expect(log.fatigueEffect).toBe(-3);
      expect(log.insightEffect).toBe(2);
      // fatigue 9+1=10 (capped at MAX), insight 10+1=10 (capped at MAX)
      expect(newState.fluctuation.fatigue).toBe(MAX_FATIGUE);
      expect(newState.fluctuation.insight).toBe(MAX_INSIGHT);
    });

    it("fatigue exactly at threshold 3 starts attenuation", () => {
      const state = {
        happiness: { nature: 5, social: 5, creation: 5, money: 5, culture: 5 },
        fluctuation: { fatigue: 3, insight: 0 },
      };
      const rawChanges: Partial<HappinessPillars> = { nature: 2 };

      const { newState, log } = system.applyEffect(
        state,
        rawChanges,
        "test-threshold",
        9,
        "winter",
      );

      // fatigue=3, floor(3/3)=1 attenuation
      // nature: max(0, 2 - 1) = 1 -> 5 + 1 = 6
      expect(newState.happiness.nature).toBe(6);
      expect(log.fatigueEffect).toBe(-1);
    });
  });

  describe("applyRest", () => {
    let system: HappinessSystem;

    beforeEach(() => {
      system = new HappinessSystem();
    });

    it("fatigue 5 becomes 2 (5 - 3)", () => {
      const fluctuation: FluctuationState = { fatigue: 5, insight: 0 };
      const result = system.applyRest(fluctuation);
      expect(result.fatigue).toBe(2);
    });

    it("fatigue does not go below 0", () => {
      const fluctuation: FluctuationState = { fatigue: 2, insight: 0 };
      const result = system.applyRest(fluctuation);
      expect(result.fatigue).toBe(0); // max(0, 2-3) = 0
    });
  });

  describe("calculateBalanceBonus", () => {
    let system: HappinessSystem;

    beforeEach(() => {
      system = new HappinessSystem();
    });

    it("all axes >= 8 with min 10 gives bonus", () => {
      const axes = { kurashi: 12, tsunagari: 10, jibun: 14 };
      // min = 10, bonus = floor(10/2) = 5
      expect(system.calculateBalanceBonus(axes)).toBe(5);
    });

    it("one axis below 8 gives no bonus", () => {
      const axes = { kurashi: 12, tsunagari: 5, jibun: 14 };
      expect(system.calculateBalanceBonus(axes)).toBe(0);
    });
  });

  describe("calculateFinalScore", () => {
    let system: HappinessSystem;

    beforeEach(() => {
      system = new HappinessSystem();
    });

    it("calculates sum of all pillars plus balance bonus", () => {
      const pillars: HappinessPillars = {
        nature: 10,
        social: 10,
        creation: 10,
        money: 10,
        culture: 10,
      };
      // base = 10+10+10+10+10 = 50
      // axes: kurashi=20, tsunagari=10, jibun=20
      // min=10, bonus=floor(10/2)=5
      expect(system.calculateFinalScore(pillars)).toBe(55);
    });

    it("no bonus when axes are unbalanced", () => {
      const pillars: HappinessPillars = {
        nature: 1,
        social: 2,
        creation: 3,
        money: 4,
        culture: 5,
      };
      // base = 1+2+3+4+5 = 15
      // axes: kurashi=5, tsunagari=2, jibun=8
      // min=2 < 8, no bonus
      expect(system.calculateFinalScore(pillars)).toBe(15);
    });
  });
});
