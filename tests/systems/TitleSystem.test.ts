import { describe, it, expect } from "vitest";
import { TitleSystem } from "@/systems/TitleSystem";
import { TITLE_DEFINITIONS } from "@/data/title-definitions";
import type {
  HappinessPillars,
  NPCAffinity,
  ResolvedEvent,
  TitleDefinition,
} from "@/types";

const makePillars = (
  overrides: Partial<HappinessPillars> = {},
): HappinessPillars => ({
  nature: 0,
  social: 0,
  creation: 0,
  money: 0,
  culture: 0,
  ...overrides,
});

const makeAffinity = (npcId: string, level: number): NPCAffinity => ({
  npcId,
  level,
  romanceLevel: 0,
});

const makeEvent = (templateId: string): ResolvedEvent => ({
  templateId,
  title: "Test",
  description: "Test",
  weather: "sunny",
  choices: [],
  effects: {},
});

describe("TitleSystem", () => {
  const system = new TitleSystem(TITLE_DEFINITIONS);

  describe("checkNewTitles", () => {
    it("awards balance_award when all 3 axes >= 8 (minEach: 8)", () => {
      // kurashi = nature + money, tsunagari = social, jibun = creation + culture
      // Each axis must be >= 8
      const pillars = makePillars({
        nature: 4,
        money: 4,
        social: 8,
        creation: 4,
        culture: 4,
      });
      const result = system.checkNewTitles(pillars, [], [], []);
      const ids = result.map((t) => t.id);

      expect(ids).toContain("balance_award");
    });

    it("does not return already earned titles", () => {
      const pillars = makePillars({
        nature: 4,
        money: 4,
        social: 8,
        creation: 4,
        culture: 4,
      });
      const result = system.checkNewTitles(pillars, [], [], ["balance_award"]);
      const ids = result.map((t) => t.id);

      expect(ids).not.toContain("balance_award");
    });

    it("returns multiple titles when multiple conditions are met simultaneously", () => {
      // Meet balance_award + culture_award + nature_lover
      const pillars = makePillars({
        nature: 15,
        money: 15,
        social: 15,
        creation: 15,
        culture: 15,
      });
      const events = Array.from({ length: 15 }, (_, i) =>
        makeEvent(`evt-${i}`),
      );
      const affinities = [
        makeAffinity("a", 50),
        makeAffinity("b", 50),
        makeAffinity("c", 50),
        makeAffinity("d", 50),
      ];

      const result = system.checkNewTitles(pillars, affinities, events, []);
      const ids = result.map((t) => t.id);

      expect(ids).toContain("balance_award");
      expect(ids).toContain("culture_award");
      expect(ids).toContain("nature_lover");
      expect(ids).toContain("merchant");
      expect(ids).toContain("social_butterfly");
      expect(ids).toContain("creator");
      expect(ids).toContain("friendship_master");
      expect(ids).toContain("adventurer");
    });

    it("awards pillar_threshold titles when pillar reaches min (culture >= 15)", () => {
      const pillars = makePillars({ culture: 15 });
      const result = system.checkNewTitles(pillars, [], [], []);
      const ids = result.map((t) => t.id);

      expect(ids).toContain("culture_award");
    });

    it("awards affinity_count when enough NPCs have high affinity (4 NPCs >= 50)", () => {
      const pillars = makePillars();
      const affinities = [
        makeAffinity("a", 50),
        makeAffinity("b", 60),
        makeAffinity("c", 50),
        makeAffinity("d", 70),
      ];
      const result = system.checkNewTitles(pillars, affinities, [], []);
      const ids = result.map((t) => t.id);

      expect(ids).toContain("friendship_master");
    });

    it("does not award affinity_count when not enough NPCs meet threshold", () => {
      const pillars = makePillars();
      const affinities = [
        makeAffinity("a", 50),
        makeAffinity("b", 40), // below threshold
        makeAffinity("c", 50),
        makeAffinity("d", 50),
      ];
      const result = system.checkNewTitles(pillars, affinities, [], []);
      const ids = result.map((t) => t.id);

      expect(ids).not.toContain("friendship_master");
    });

    it("awards event_count when event history has enough events (>= 15)", () => {
      const pillars = makePillars();
      const events = Array.from({ length: 15 }, (_, i) =>
        makeEvent(`evt-${i}`),
      );
      const result = system.checkNewTitles(pillars, [], events, []);
      const ids = result.map((t) => t.id);

      expect(ids).toContain("adventurer");
    });

    it("does not award event_count when below threshold", () => {
      const pillars = makePillars();
      const events = Array.from({ length: 14 }, (_, i) =>
        makeEvent(`evt-${i}`),
      );
      const result = system.checkNewTitles(pillars, [], events, []);
      const ids = result.map((t) => t.id);

      expect(ids).not.toContain("adventurer");
    });
  });

  describe("getUnlockedEventIds", () => {
    it("returns event IDs linked to earned titles", () => {
      const result = system.getUnlockedEventIds([
        "culture_award",
        "friendship_master",
      ]);

      expect(result).toContain("rare_culture_festival");
      expect(result).toContain("rare_group_event");
    });

    it("returns empty array when no earned titles have unlocks", () => {
      const result = system.getUnlockedEventIds(["balance_award"]);

      expect(result).toEqual([]);
    });

    it("returns empty array when no titles earned", () => {
      const result = system.getUnlockedEventIds([]);

      expect(result).toEqual([]);
    });
  });
});
