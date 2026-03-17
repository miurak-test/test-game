import { describe, it, expect } from "vitest";
import { EVENT_TEMPLATES } from "@/data/event-templates";
import { EVENT_CHAINS } from "@/data/event-chains";
import { RARE_EVENTS } from "@/data/rare-events";
import { NPCS } from "@/data/npc-data";
import type { Season } from "@/types";

describe("event-templates データ検証", () => {
  const seasons: Season[] = ["spring", "summer", "autumn", "winter"];

  it("各季節に 8 テンプレート存在すること（合計 32）", () => {
    expect(EVENT_TEMPLATES).toHaveLength(32);

    for (const season of seasons) {
      const count = EVENT_TEMPLATES.filter((t) => t.season === season).length;
      expect(count).toBe(8);
    }
  });

  it("全テンプレートに weatherVariants の 3 天候定義があること", () => {
    const weathers = ["sunny", "rainy", "snowy"] as const;

    for (const template of EVENT_TEMPLATES) {
      for (const weather of weathers) {
        expect(
          template.weatherVariants[weather],
          `テンプレート ${template.id} に ${weather} の天候バリアントがない`,
        ).toBeDefined();
      }
    }
  });

  it("チェーンが各季節 1 本（3 ステップ）存在すること", () => {
    expect(EVENT_CHAINS).toHaveLength(12); // 4 seasons * 3 steps

    const chainIds = [...new Set(EVENT_CHAINS.map((t) => t.chainId))];
    expect(chainIds).toHaveLength(4);

    for (const chainId of chainIds) {
      const steps = EVENT_CHAINS.filter((t) => t.chainId === chainId);
      expect(steps).toHaveLength(3);

      // ステップが 1, 2, 3 であること
      const stepNumbers = steps.map((t) => t.chainStep).sort();
      expect(stepNumbers).toEqual([1, 2, 3]);
    }

    // 各チェーンに weatherVariants の 3 天候定義があること
    const weathers = ["sunny", "rainy", "snowy"] as const;
    for (const template of EVENT_CHAINS) {
      for (const weather of weathers) {
        expect(
          template.weatherVariants[weather],
          `チェーン ${template.id} に ${weather} の天候バリアントがない`,
        ).toBeDefined();
      }
    }
  });

  it("レアイベントが 8 枚存在すること", () => {
    expect(RARE_EVENTS).toHaveLength(8);

    // 全て isRare フラグが true であること
    for (const rare of RARE_EVENTS) {
      expect(rare.isRare).toBe(true);
    }

    // weatherVariants の 3 天候定義があること
    const weathers = ["sunny", "rainy", "snowy"] as const;
    for (const template of RARE_EVENTS) {
      for (const weather of weathers) {
        expect(
          template.weatherVariants[weather],
          `レアイベント ${template.id} に ${weather} の天候バリアントがない`,
        ).toBeDefined();
      }
    }
  });

  it("NPC バリアントの npcId が npc-data に存在すること", () => {
    const npcIds = new Set(NPCS.map((n) => n.id));
    const allTemplates = [...EVENT_TEMPLATES, ...EVENT_CHAINS, ...RARE_EVENTS];

    for (const template of allTemplates) {
      if (template.npcVariants) {
        for (const npcId of Object.keys(template.npcVariants)) {
          expect(
            npcIds.has(npcId),
            `テンプレート ${template.id} の npcVariant "${npcId}" が NPCS に存在しない`,
          ).toBe(true);
        }
      }
    }
  });

  it("全テンプレートの id がユニークであること", () => {
    const allTemplates = [...EVENT_TEMPLATES, ...EVENT_CHAINS, ...RARE_EVENTS];
    const ids = allTemplates.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("NPC データが 4 人定義されていること", () => {
    expect(NPCS).toHaveLength(4);
    const npcIds = NPCS.map((n) => n.id);
    expect(npcIds).toContain("tanuki");
    expect(npcIds).toContain("kitsune");
    expect(npcIds).toContain("usagi");
    expect(npcIds).toContain("kuma");
  });
});
