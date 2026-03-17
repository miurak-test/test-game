import type {
  TitleDefinition,
  TitleCondition,
  HappinessPillars,
  HappinessAxes,
  NPCAffinity,
  ResolvedEvent,
} from "@/types";
import { HappinessSystem } from "./HappinessSystem";

export class TitleSystem {
  constructor(private definitions: TitleDefinition[]) {}

  /** Check which new titles are earned based on current state */
  checkNewTitles(
    pillars: HappinessPillars,
    affinities: NPCAffinity[],
    eventHistory: ResolvedEvent[],
    alreadyEarned: string[],
  ): TitleDefinition[] {
    const axes = HappinessSystem.toAxes(pillars);
    return this.definitions.filter((def) => {
      if (alreadyEarned.includes(def.id)) return false;
      return this.meetsCondition(
        def.condition,
        pillars,
        axes,
        affinities,
        eventHistory,
      );
    });
  }

  /** Get event IDs unlocked by earned titles */
  getUnlockedEventIds(earnedTitles: string[]): string[] {
    return this.definitions
      .filter((d) => earnedTitles.includes(d.id) && d.unlocksEvents)
      .flatMap((d) => d.unlocksEvents!);
  }

  private meetsCondition(
    condition: TitleCondition,
    pillars: HappinessPillars,
    axes: HappinessAxes,
    affinities: NPCAffinity[],
    eventHistory: ResolvedEvent[],
  ): boolean {
    switch (condition.type) {
      case "pillar_threshold":
        return pillars[condition.pillar] >= condition.min;

      case "axis_balance":
        return (
          axes.kurashi >= condition.minEach &&
          axes.tsunagari >= condition.minEach &&
          axes.jibun >= condition.minEach
        );

      case "affinity_threshold": {
        const level =
          affinities.find((a) => a.npcId === condition.npcId)?.level ?? 0;
        return level >= condition.min;
      }

      case "affinity_count": {
        const count = affinities.filter(
          (a) => a.level >= condition.minLevel,
        ).length;
        return count >= condition.count;
      }

      case "event_count":
        return eventHistory.length >= condition.count;

      case "specific_event":
        return eventHistory.some((e) => e.templateId === condition.eventId);

      default:
        return false;
    }
  }
}
