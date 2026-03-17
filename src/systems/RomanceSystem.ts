import type {
  NPCAffinity,
  NPC,
  Gender,
  Season,
  ResolvedEvent,
  RomanceHighlight,
} from "@/types";

export class RomanceSystem {
  /** Update affinity for a specific NPC, clamped to 0-100 */
  updateAffinity(
    affinities: NPCAffinity[],
    npcId: string,
    change: number,
  ): NPCAffinity[] {
    return affinities.map((a) =>
      a.npcId === npcId
        ? { ...a, level: Math.max(0, Math.min(100, a.level + change)) }
        : a,
    );
  }

  /** Increase romanceLevel by 5 when affinity >= 50 and is a romance event */
  updateRomanceLevel(
    affinity: NPCAffinity,
    isRomanceEvent: boolean,
  ): NPCAffinity {
    if (!isRomanceEvent || affinity.level < 50) return affinity;
    return {
      ...affinity,
      romanceLevel: Math.min(100, affinity.romanceLevel + 5),
    };
  }

  /** Returns true when affinity >= 30 (romance event eligibility) */
  shouldTriggerRomanceEvent(affinity: NPCAffinity): boolean {
    return affinity.level >= 30;
  }

  /** Get romance highlight for a season (highest-affinity NPC with romance events) */
  getSeasonRomanceHighlight(
    affinities: NPCAffinity[],
    eventHistory: ResolvedEvent[],
    season: Season,
  ): RomanceHighlight | null {
    // Find events that have romance effects and an NPC
    const romanceEvents = eventHistory.filter(
      (e) => e.npc && e.effects.romance,
    );
    if (romanceEvents.length === 0) return null;

    // Sort affinities by level descending to find highest
    const sorted = [...affinities].sort((a, b) => b.level - a.level);

    for (const aff of sorted) {
      const event = romanceEvents.find((e) => e.npc?.id === aff.npcId);
      if (event) {
        return {
          season,
          npcId: aff.npcId,
          eventId: event.templateId,
          description: event.title,
        };
      }
    }

    return null;
  }

  /** All NPCs are romanceable regardless of player gender */
  getRomanceableNPCs(npcs: NPC[], _playerGender: Gender): NPC[] {
    return npcs;
  }

  /** Create initial affinity list for all NPCs */
  static createInitialAffinities(npcs: NPC[]): NPCAffinity[] {
    return npcs.map((npc) => ({ npcId: npc.id, level: 0, romanceLevel: 0 }));
  }
}
