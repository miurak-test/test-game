import { describe, it, expect } from "vitest";
import { RomanceSystem } from "@/systems/RomanceSystem";
import type { NPCAffinity, NPC, ResolvedEvent } from "@/types";

const makeAffinity = (
  npcId: string,
  level: number,
  romanceLevel = 0,
): NPCAffinity => ({
  npcId,
  level,
  romanceLevel,
});

const makeNPC = (id: string): NPC => ({
  id,
  name: `NPC_${id}`,
  spriteKey: `sprite_${id}`,
  personality: "cheerful",
  giftPreferences: [],
});

const makeEvent = (
  templateId: string,
  npcId?: string,
  romance?: { npcId: string; change: number },
): ResolvedEvent => ({
  templateId,
  title: "Test Event",
  description: "Test",
  weather: "sunny",
  npc: npcId ? makeNPC(npcId) : undefined,
  choices: [],
  effects: { romance },
});

describe("RomanceSystem", () => {
  const system = new RomanceSystem();

  describe("updateAffinity", () => {
    it("increases affinity for the specified NPC", () => {
      const affinities = [makeAffinity("a", 10), makeAffinity("b", 20)];
      const result = system.updateAffinity(affinities, "a", 5);

      expect(result[0].level).toBe(15);
      expect(result[1].level).toBe(20); // unchanged
    });

    it("decreases affinity for the specified NPC", () => {
      const affinities = [makeAffinity("a", 30)];
      const result = system.updateAffinity(affinities, "a", -10);

      expect(result[0].level).toBe(20);
    });

    it("clamps affinity to 0-100 range (lower bound)", () => {
      const affinities = [makeAffinity("a", 5)];
      const result = system.updateAffinity(affinities, "a", -20);

      expect(result[0].level).toBe(0);
    });

    it("clamps affinity to 0-100 range (upper bound)", () => {
      const affinities = [makeAffinity("a", 95)];
      const result = system.updateAffinity(affinities, "a", 10);

      expect(result[0].level).toBe(100);
    });
  });

  describe("updateRomanceLevel", () => {
    it("increases romanceLevel by 5 when affinity >= 50 and is romance event", () => {
      const affinity = makeAffinity("a", 60, 10);
      const result = system.updateRomanceLevel(affinity, true);

      expect(result.romanceLevel).toBe(15);
    });

    it("does not change romanceLevel when affinity < 50", () => {
      const affinity = makeAffinity("a", 40, 10);
      const result = system.updateRomanceLevel(affinity, true);

      expect(result.romanceLevel).toBe(10);
    });

    it("does not change romanceLevel when not a romance event", () => {
      const affinity = makeAffinity("a", 60, 10);
      const result = system.updateRomanceLevel(affinity, false);

      expect(result.romanceLevel).toBe(10);
    });

    it("clamps romanceLevel to max 100", () => {
      const affinity = makeAffinity("a", 80, 98);
      const result = system.updateRomanceLevel(affinity, true);

      expect(result.romanceLevel).toBe(100);
    });
  });

  describe("shouldTriggerRomanceEvent", () => {
    it("returns true when affinity >= 30", () => {
      expect(system.shouldTriggerRomanceEvent(makeAffinity("a", 30))).toBe(
        true,
      );
      expect(system.shouldTriggerRomanceEvent(makeAffinity("a", 50))).toBe(
        true,
      );
    });

    it("returns false when affinity < 30", () => {
      expect(system.shouldTriggerRomanceEvent(makeAffinity("a", 29))).toBe(
        false,
      );
      expect(system.shouldTriggerRomanceEvent(makeAffinity("a", 0))).toBe(
        false,
      );
    });
  });

  describe("getRomanceableNPCs", () => {
    it("returns all NPCs regardless of player gender", () => {
      const npcs = [makeNPC("a"), makeNPC("b"), makeNPC("c")];

      expect(system.getRomanceableNPCs(npcs, "male")).toEqual(npcs);
      expect(system.getRomanceableNPCs(npcs, "female")).toEqual(npcs);
    });
  });

  describe("createInitialAffinities", () => {
    it("creates affinity entries for all NPCs with level 0", () => {
      const npcs = [makeNPC("a"), makeNPC("b"), makeNPC("c")];
      const result = RomanceSystem.createInitialAffinities(npcs);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { npcId: "a", level: 0, romanceLevel: 0 },
        { npcId: "b", level: 0, romanceLevel: 0 },
        { npcId: "c", level: 0, romanceLevel: 0 },
      ]);
    });
  });

  describe("getSeasonRomanceHighlight", () => {
    it("returns highlight for the NPC with highest affinity who has events in the season", () => {
      const affinities = [makeAffinity("a", 80), makeAffinity("b", 50)];
      const eventHistory = [
        makeEvent("evt1", "a", { npcId: "a", change: 5 }),
        makeEvent("evt2", "b", { npcId: "b", change: 3 }),
      ];

      const result = system.getSeasonRomanceHighlight(
        affinities,
        eventHistory,
        "spring",
      );

      expect(result).not.toBeNull();
      expect(result!.npcId).toBe("a");
      expect(result!.season).toBe("spring");
    });

    it("returns null when no romance events exist", () => {
      const affinities = [makeAffinity("a", 80)];
      const eventHistory = [makeEvent("evt1")]; // no NPC, no romance

      const result = system.getSeasonRomanceHighlight(
        affinities,
        eventHistory,
        "spring",
      );

      expect(result).toBeNull();
    });
  });
});
