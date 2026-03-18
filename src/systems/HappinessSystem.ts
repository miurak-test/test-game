import type {
  HappinessPillars,
  HappinessAxes,
  FluctuationState,
  HappinessChangeLog,
  Season,
} from "@/types";
import {
  FATIGUE_DECAY_PER_REST,
  INSIGHT_BONUS_THRESHOLD,
  MAX_FATIGUE,
  MAX_INSIGHT,
} from "@/constants";

export class HappinessSystem {
  /** 5 pillars to 3 axes conversion */
  static toAxes(pillars: HappinessPillars): HappinessAxes {
    return {
      kurashi: pillars.nature + pillars.money,
      tsunagari: pillars.social,
      jibun: pillars.creation + pillars.culture,
    };
  }

  /** Apply event effects with fatigue/insight modifiers */
  applyEffect(
    state: { happiness: HappinessPillars; fluctuation: FluctuationState },
    rawChanges: Partial<HappinessPillars>,
    source: string,
    turn: number,
    season: Season,
  ): { newState: typeof state; log: HappinessChangeLog } {
    const pillars = { ...state.happiness };
    const fluctuation = { ...state.fluctuation };

    // 1. Calculate total positive changes
    const positiveSum = Object.values(rawChanges).reduce(
      (sum, v) => sum + Math.max(0, v ?? 0),
      0,
    );
    const hasNegative = Object.values(rawChanges).some((v) => (v ?? 0) < 0);

    // 2. Accumulate fatigue on positive changes (capped at MAX_FATIGUE)
    if (positiveSum > 0) {
      fluctuation.fatigue = Math.min(MAX_FATIGUE, fluctuation.fatigue + 1);
    }

    // 3. Accumulate insight on negative changes (capped at MAX_INSIGHT)
    if (hasNegative) {
      fluctuation.insight = Math.min(MAX_INSIGHT, fluctuation.insight + 1);
    }

    // 4. Fatigue attenuation: if fatigue >= 3, reduce positive changes
    const fatigueAttenuation =
      state.fluctuation.fatigue >= 3
        ? Math.floor(state.fluctuation.fatigue / 3)
        : 0;

    // 5. Insight bonus: if insight >= INSIGHT_BONUS_THRESHOLD, bonus to creation/culture
    const insightBonus =
      state.fluctuation.insight >= INSIGHT_BONUS_THRESHOLD
        ? Math.floor(state.fluctuation.insight / INSIGHT_BONUS_THRESHOLD)
        : 0;

    // 6. Apply changes to each pillar
    const finalChanges: Partial<HappinessPillars> = {};
    const pillarKeys: (keyof HappinessPillars)[] = [
      "nature",
      "social",
      "creation",
      "money",
      "culture",
    ];

    for (const key of pillarKeys) {
      let change = rawChanges[key] ?? 0;

      // Apply fatigue attenuation to positive changes
      if (change > 0) {
        change = Math.max(0, change - fatigueAttenuation);
      }

      // Apply insight bonus to creation and culture
      if ((key === "creation" || key === "culture") && insightBonus > 0) {
        change += insightBonus;
      }

      if (change !== 0) {
        finalChanges[key] = change;
      }

      // Apply and clamp to 0
      pillars[key] = Math.max(0, pillars[key] + change);
    }

    const log: HappinessChangeLog = {
      turn,
      season,
      source,
      rawChanges,
      fatigueEffect: fatigueAttenuation > 0 ? -fatigueAttenuation : 0,
      insightEffect: insightBonus,
      finalChanges,
    };

    return {
      newState: { happiness: pillars, fluctuation },
      log,
    };
  }

  /** Rest tile effect: reduce fatigue */
  applyRest(fluctuation: FluctuationState): FluctuationState {
    return {
      ...fluctuation,
      fatigue: Math.max(0, fluctuation.fatigue - FATIGUE_DECAY_PER_REST),
    };
  }

  /** Balance bonus calculation */
  calculateBalanceBonus(axes: HappinessAxes): number {
    const min = Math.min(axes.kurashi, axes.tsunagari, axes.jibun);
    if (min >= 8) return Math.floor(min / 2);
    return 0;
  }

  /** Final score calculation */
  calculateFinalScore(pillars: HappinessPillars): number {
    const axes = HappinessSystem.toAxes(pillars);
    const base =
      pillars.nature +
      pillars.social +
      pillars.creation +
      pillars.money +
      pillars.culture;
    const bonus = this.calculateBalanceBonus(axes);
    return base + bonus;
  }
}
