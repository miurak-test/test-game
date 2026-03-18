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

  describe("condition boundary tests", () => {
    it("pillar_threshold: exact threshold value earns title", () => {
      // culture_award requires culture >= 15
      const pillars = makePillars({ culture: 15 });
      const result = system.checkNewTitles(pillars, [], [], []);
      expect(result.map((t) => t.id)).toContain("culture_award");
    });

    it("pillar_threshold: below threshold does not earn title", () => {
      // culture_award requires culture >= 15
      const pillars = makePillars({ culture: 14 });
      const result = system.checkNewTitles(pillars, [], [], []);
      expect(result.map((t) => t.id)).not.toContain("culture_award");
    });

    it("axis_balance: exact minEach value earns title", () => {
      // balance_award requires all axes >= 8
      // kurashi = nature + money, tsunagari = social, jibun = creation + culture
      const pillars = makePillars({
        nature: 4,
        money: 4,   // kurashi = 8
        social: 8,   // tsunagari = 8
        creation: 4,
        culture: 4,  // jibun = 8
      });
      const result = system.checkNewTitles(pillars, [], [], []);
      expect(result.map((t) => t.id)).toContain("balance_award");
    });

    it("axis_balance: one axis at minEach-1 does not earn title", () => {
      const pillars = makePillars({
        nature: 4,
        money: 4,   // kurashi = 8
        social: 7,   // tsunagari = 7 (below 8)
        creation: 4,
        culture: 4,  // jibun = 8
      });
      const result = system.checkNewTitles(pillars, [], [], []);
      expect(result.map((t) => t.id)).not.toContain("balance_award");
    });

    it("affinity_count: exact count at exact minLevel earns title", () => {
      // friendship_master requires 4 NPCs with level >= 50
      const affinities = [
        makeAffinity("a", 50),
        makeAffinity("b", 50),
        makeAffinity("c", 50),
        makeAffinity("d", 50),
      ];
      const result = system.checkNewTitles(makePillars(), affinities, [], []);
      expect(result.map((t) => t.id)).toContain("friendship_master");
    });

    it("affinity_count: one NPC below minLevel does not earn title", () => {
      const affinities = [
        makeAffinity("a", 50),
        makeAffinity("b", 49), // below threshold
        makeAffinity("c", 50),
        makeAffinity("d", 50),
      ];
      const result = system.checkNewTitles(makePillars(), affinities, [], []);
      expect(result.map((t) => t.id)).not.toContain("friendship_master");
    });

    it("event_count: exact count earns title", () => {
      // adventurer requires 15 events
      const events = Array.from({ length: 15 }, (_, i) =>
        makeEvent(`evt-${i}`),
      );
      const result = system.checkNewTitles(makePillars(), [], events, []);
      expect(result.map((t) => t.id)).toContain("adventurer");
    });

    it("event_count: one below count does not earn title", () => {
      const events = Array.from({ length: 14 }, (_, i) =>
        makeEvent(`evt-${i}`),
      );
      const result = system.checkNewTitles(makePillars(), [], events, []);
      expect(result.map((t) => t.id)).not.toContain("adventurer");
    });

    it("multiple titles earned in same turn", () => {
      // Set all pillars high enough for multiple pillar_threshold titles
      const pillars = makePillars({
        nature: 15,
        social: 15,
        creation: 15,
        money: 15,
        culture: 15,
      });
      const result = system.checkNewTitles(pillars, [], [], []);
      const ids = result.map((t) => t.id);

      // Should earn at least culture_award, nature_lover, merchant, social_butterfly, creator
      expect(ids).toContain("culture_award");
      expect(ids).toContain("nature_lover");
      expect(ids).toContain("merchant");
      expect(ids).toContain("social_butterfly");
      expect(ids).toContain("creator");
      expect(result.length).toBeGreaterThanOrEqual(5);
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
