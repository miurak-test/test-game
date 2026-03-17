import { describe, it, expect } from "vitest";
import { EventSystem } from "@/systems/EventSystem";
import type { EventContext } from "@/systems/EventSystem";
import type {
  EventTemplate,
  EventChoice,
  NPCAffinity,
  NPC,
} from "@/types";

// --- テスト用ヘルパー ---

function makeTemplate(overrides: Partial<EventTemplate> = {}): EventTemplate {
  return {
    id: "test-template",
    season: "spring",
    baseTitle: "テストイベント",
    baseDescription: "テスト用の説明文。",
    tileTypes: ["life"],
    weatherVariants: {
      sunny: { titleSuffix: "（晴れ）", effectModifier: { happiness: { nature: 1 } } },
      rainy: {
        titleSuffix: "（雨）",
        descriptionOverride: "雨の日の説明。",
        effectModifier: { happiness: { culture: 1 } },
      },
      snowy: { titleSuffix: "（雪）", effectModifier: { happiness: { nature: 1, culture: 1 } } },
    },
    ...overrides,
  };
}

function makeContext(overrides: Partial<EventContext> = {}): EventContext {
  return {
    season: "spring",
    tileType: "life",
    weather: "sunny",
    affinities: [],
    earnedTitles: [],
    activeChains: {},
    turn: 1,
    ...overrides,
  };
}

const testNpcs: NPC[] = [
  { id: "tanuki", name: "タヌキチ", spriteKey: "npc_tanuki", personality: "cheerful", giftPreferences: ["food"] },
  { id: "kitsune", name: "キツネ丸", spriteKey: "npc_kitsune", personality: "mysterious", giftPreferences: ["book"] },
];

// --- テスト ---

describe("EventSystem", () => {
  describe("resolveEvent", () => {
    it("基本テンプレートが天候バリアントで変形されること", () => {
      const template = makeTemplate();
      const system = new EventSystem([template], [], [], testNpcs);

      // sunny
      const sunnyResult = system.resolveEvent(makeContext({ weather: "sunny" }));
      expect(sunnyResult.templateId).toBe("test-template");
      expect(sunnyResult.title).toBe("テストイベント（晴れ）");
      expect(sunnyResult.description).toBe("テスト用の説明文。");
      expect(sunnyResult.effects.happiness?.nature).toBe(1);

      // rainy - descriptionOverride あり
      const rainyResult = system.resolveEvent(makeContext({ weather: "rainy" }));
      expect(rainyResult.title).toBe("テストイベント（雨）");
      expect(rainyResult.description).toBe("雨の日の説明。");
      expect(rainyResult.effects.happiness?.culture).toBe(1);

      // snowy
      const snowyResult = system.resolveEvent(makeContext({ weather: "snowy" }));
      expect(snowyResult.title).toBe("テストイベント（雪）");
      expect(snowyResult.effects.happiness?.nature).toBe(1);
      expect(snowyResult.effects.happiness?.culture).toBe(1);
    });

    it("NPC バリアントで台詞と効果が上書きされること", () => {
      const template = makeTemplate({
        npcVariants: {
          tanuki: {
            dialogueOverride: "タヌキチ「やあ！」",
            effectModifier: { affinity: [{ npcId: "tanuki", change: 2 }] },
          },
        },
      });
      const system = new EventSystem([template], [], [], testNpcs);

      const npc = testNpcs[0]; // tanuki
      const result = system.resolveEvent(makeContext({ currentNpc: npc }));

      expect(result.description).toContain("タヌキチ「やあ！」");
      expect(result.npc).toEqual(npc);
      expect(result.effects.affinity).toEqual([{ npcId: "tanuki", change: 2 }]);
    });

    it("天候 + NPC 両方の変形が適用されること", () => {
      const template = makeTemplate({
        npcVariants: {
          kitsune: {
            dialogueOverride: "キツネ丸「雨は不思議だ。」",
            effectModifier: {
              happiness: { culture: 1 },
              affinity: [{ npcId: "kitsune", change: 1 }],
            },
          },
        },
      });
      const system = new EventSystem([template], [], [], testNpcs);

      const npc = testNpcs[1]; // kitsune
      const result = system.resolveEvent(
        makeContext({ weather: "rainy", currentNpc: npc }),
      );

      // 天候バリアント: rainy -> title に（雨）、description は descriptionOverride
      expect(result.title).toBe("テストイベント（雨）");
      // description は weatherVariant の descriptionOverride + npcVariant の dialogueOverride
      expect(result.description).toContain("雨の日の説明。");
      expect(result.description).toContain("キツネ丸「雨は不思議だ。」");

      // 天候 culture: 1 + NPC culture: 1 = 2
      expect(result.effects.happiness?.culture).toBe(2);
      expect(result.effects.affinity).toEqual([{ npcId: "kitsune", change: 1 }]);
    });
  });

  describe("filterChoices", () => {
    const system = new EventSystem([], [], [], testNpcs);

    it("好感度不足の選択肢がフィルタされること", () => {
      const choices: EventChoice[] = [
        { id: "c1", text: "通常", effects: { happiness: { social: 1 } } },
        {
          id: "c2",
          text: "好感度必要",
          requiredAffinity: { npcId: "tanuki", minLevel: 30 },
          effects: { happiness: { social: 2 } },
        },
      ];

      // 好感度 10 → minLevel 30 に足りない
      const affinities: NPCAffinity[] = [
        { npcId: "tanuki", level: 10, romanceLevel: 0 },
      ];

      const filtered = system.filterChoices(choices, affinities, []);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("c1");
    });

    it("称号未取得の選択肢がフィルタされること", () => {
      const choices: EventChoice[] = [
        { id: "c1", text: "通常", effects: { happiness: { social: 1 } } },
        {
          id: "c2",
          text: "称号必要",
          requiredTitle: "hero",
          effects: { happiness: { social: 2 } },
        },
      ];

      const filtered = system.filterChoices(choices, [], []);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("c1");
    });

    it("条件を満たす選択肢は残ること", () => {
      const choices: EventChoice[] = [
        { id: "c1", text: "通常", effects: { happiness: { social: 1 } } },
        {
          id: "c2",
          text: "好感度必要",
          requiredAffinity: { npcId: "tanuki", minLevel: 30 },
          effects: { happiness: { social: 2 } },
        },
        {
          id: "c3",
          text: "称号必要",
          requiredTitle: "hero",
          effects: { happiness: { social: 3 } },
        },
      ];

      const affinities: NPCAffinity[] = [
        { npcId: "tanuki", level: 50, romanceLevel: 0 },
      ];
      const titles = ["hero"];

      const filtered = system.filterChoices(choices, affinities, titles);
      expect(filtered).toHaveLength(3);
      expect(filtered.map((c) => c.id)).toEqual(["c1", "c2", "c3"]);
    });

    it("affinities に該当 NPC がいない場合はフィルタされること", () => {
      const choices: EventChoice[] = [
        {
          id: "c1",
          text: "好感度必要",
          requiredAffinity: { npcId: "tanuki", minLevel: 10 },
          effects: { happiness: { social: 1 } },
        },
      ];

      // affinities が空
      const filtered = system.filterChoices(choices, [], []);
      expect(filtered).toHaveLength(0);
    });
  });

  describe("resolveChainNext", () => {
    it("次ステップが正しく返ること", () => {
      const chainTemplates: EventTemplate[] = [
        makeTemplate({
          id: "chain-test-1",
          chainId: "test-chain",
          chainStep: 1,
        }),
        makeTemplate({
          id: "chain-test-2",
          chainId: "test-chain",
          chainStep: 2,
          baseTitle: "チェーン2",
        }),
        makeTemplate({
          id: "chain-test-3",
          chainId: "test-chain",
          chainStep: 3,
          baseTitle: "チェーン3",
        }),
      ];
      const system = new EventSystem([], chainTemplates, [], testNpcs);

      const result = system.resolveChainNext("test-chain", 1, makeContext());
      expect(result).not.toBeNull();
      expect(result!.templateId).toBe("chain-test-2");
      expect(result!.title).toContain("チェーン2");
    });

    it("最終ステップの次は null", () => {
      const chainTemplates: EventTemplate[] = [
        makeTemplate({
          id: "chain-test-1",
          chainId: "test-chain",
          chainStep: 1,
        }),
        makeTemplate({
          id: "chain-test-2",
          chainId: "test-chain",
          chainStep: 2,
        }),
      ];
      const system = new EventSystem([], chainTemplates, [], testNpcs);

      const result = system.resolveChainNext("test-chain", 2, makeContext());
      expect(result).toBeNull();
    });

    it("存在しない chainId は null", () => {
      const system = new EventSystem([], [], [], testNpcs);
      const result = system.resolveChainNext("nonexistent", 1, makeContext());
      expect(result).toBeNull();
    });
  });

  describe("checkRareEvent", () => {
    it("確率 0 で null が返ること（rng が 0.05 以上を返す場合）", () => {
      const rareTemplates: EventTemplate[] = [
        makeTemplate({ id: "rare-test", isRare: true }),
      ];
      const system = new EventSystem([], [], rareTemplates, testNpcs);

      // rng が 0.05 以上 → レアイベントは発生しない
      const result = system.checkRareEvent(makeContext(), () => 0.05);
      expect(result).toBeNull();
    });

    it("確率 1 でイベント返却（rng が 0.05 未満を返す場合）", () => {
      const rareTemplates: EventTemplate[] = [
        makeTemplate({ id: "rare-test", isRare: true }),
      ];
      const system = new EventSystem([], [], rareTemplates, testNpcs);

      // rng が 0 → レアイベント発生
      const result = system.checkRareEvent(makeContext(), () => 0);
      expect(result).not.toBeNull();
      expect(result!.templateId).toBe("rare-test");
    });

    it("レアイベントが空の場合は確率内でも null", () => {
      const system = new EventSystem([], [], [], testNpcs);
      const result = system.checkRareEvent(makeContext(), () => 0);
      expect(result).toBeNull();
    });
  });

  describe("determineWeather", () => {
    it("春: sunny (0-0.5), rainy (0.5-0.9), snowy (0.9-1.0)", () => {
      expect(EventSystem.determineWeather("spring", () => 0)).toBe("sunny");
      expect(EventSystem.determineWeather("spring", () => 0.49)).toBe("sunny");
      expect(EventSystem.determineWeather("spring", () => 0.5)).toBe("rainy");
      expect(EventSystem.determineWeather("spring", () => 0.89)).toBe("rainy");
      expect(EventSystem.determineWeather("spring", () => 0.9)).toBe("snowy");
      expect(EventSystem.determineWeather("spring", () => 0.99)).toBe("snowy");
    });

    it("夏: sunny (0-0.6), rainy (0.6-0.95), snowy (0.95-1.0)", () => {
      expect(EventSystem.determineWeather("summer", () => 0)).toBe("sunny");
      expect(EventSystem.determineWeather("summer", () => 0.59)).toBe("sunny");
      expect(EventSystem.determineWeather("summer", () => 0.6)).toBe("rainy");
      expect(EventSystem.determineWeather("summer", () => 0.94)).toBe("rainy");
      expect(EventSystem.determineWeather("summer", () => 0.95)).toBe("snowy");
      expect(EventSystem.determineWeather("summer", () => 0.99)).toBe("snowy");
    });

    it("秋: sunny (0-0.4), rainy (0.4-0.8), snowy (0.8-1.0)", () => {
      expect(EventSystem.determineWeather("autumn", () => 0)).toBe("sunny");
      expect(EventSystem.determineWeather("autumn", () => 0.39)).toBe("sunny");
      expect(EventSystem.determineWeather("autumn", () => 0.4)).toBe("rainy");
      expect(EventSystem.determineWeather("autumn", () => 0.79)).toBe("rainy");
      expect(EventSystem.determineWeather("autumn", () => 0.8)).toBe("snowy");
      expect(EventSystem.determineWeather("autumn", () => 0.99)).toBe("snowy");
    });

    it("冬: sunny (0-0.3), rainy (0.3-0.5), snowy (0.5-1.0)", () => {
      expect(EventSystem.determineWeather("winter", () => 0)).toBe("sunny");
      expect(EventSystem.determineWeather("winter", () => 0.29)).toBe("sunny");
      expect(EventSystem.determineWeather("winter", () => 0.3)).toBe("rainy");
      expect(EventSystem.determineWeather("winter", () => 0.49)).toBe("rainy");
      expect(EventSystem.determineWeather("winter", () => 0.5)).toBe("snowy");
      expect(EventSystem.determineWeather("winter", () => 0.99)).toBe("snowy");
    });

    it("各季節で有効な天候型（Weather）のみが返ること", () => {
      const seasons = ["spring", "summer", "autumn", "winter"] as const;
      const validWeathers = ["sunny", "rainy", "snowy"];

      for (const season of seasons) {
        for (let i = 0; i < 10; i++) {
          const rng = () => i / 10;
          const weather = EventSystem.determineWeather(season, rng);
          expect(validWeathers).toContain(weather);
        }
      }
    });
  });
});
