import type {
  EventTemplate,
  ResolvedEvent,
  EventChoice,
  EventEffect,
  NPC,
  NPCAffinity,
  Season,
  Weather,
  TileType,
} from "@/types";

export interface EventContext {
  season: Season;
  tileType: TileType;
  weather: Weather;
  currentNpc?: NPC;
  affinities: NPCAffinity[];
  earnedTitles: string[];
  activeChains: Record<string, number>;
  turn: number;
}

export class EventSystem {
  constructor(
    private templates: EventTemplate[],
    private chains: EventTemplate[],
    private rareEvents: EventTemplate[],
    private npcs: NPC[],
  ) {}

  /** テンプレートからコンテキストに基づいて具象イベントを解決 */
  resolveEvent(context: EventContext): ResolvedEvent {
    // 1. season と tileType でテンプレートをフィルタ
    const candidates = this.templates.filter(
      (t) => t.season === context.season && t.tileTypes.includes(context.tileType),
    );

    if (candidates.length === 0) {
      // フォールバック：season のみでフィルタ
      const seasonCandidates = this.templates.filter(
        (t) => t.season === context.season,
      );
      if (seasonCandidates.length === 0) {
        throw new Error(
          `No event template found for season=${context.season}, tileType=${context.tileType}`,
        );
      }
      return this.resolveTemplate(seasonCandidates[0], context);
    }

    // 2. ランダムに1つ選択
    const template = candidates[Math.floor(Math.random() * candidates.length)];

    return this.resolveTemplate(template, context);
  }

  /** テンプレートを具象イベントに変換（内部メソッド） */
  private resolveTemplate(
    template: EventTemplate,
    context: EventContext,
  ): ResolvedEvent {
    // 3. weatherVariants を適用
    const weatherVariant = template.weatherVariants[context.weather];
    let title = template.baseTitle;
    let description = template.baseDescription;
    let effects: EventEffect = {};

    if (weatherVariant) {
      if (weatherVariant.titleSuffix) {
        title += weatherVariant.titleSuffix;
      }
      if (weatherVariant.descriptionOverride) {
        description = weatherVariant.descriptionOverride;
      }
      if (weatherVariant.effectModifier) {
        effects = this.mergeEffects(effects, weatherVariant.effectModifier);
      }
    }

    // 4. currentNpc の npcVariants を適用
    if (context.currentNpc && template.npcVariants) {
      const npcVariant = template.npcVariants[context.currentNpc.id];
      if (npcVariant) {
        if (npcVariant.dialogueOverride) {
          description += `\n${npcVariant.dialogueOverride}`;
        }
        if (npcVariant.effectModifier) {
          effects = this.mergeEffects(effects, npcVariant.effectModifier);
        }
      }
    }

    // 5. choices を filterChoices で絞る
    const choices = this.filterChoices(
      template.choices ?? [],
      context.affinities,
      context.earnedTitles,
    );

    // 6. ResolvedEvent を生成
    return {
      templateId: template.id,
      title,
      description,
      weather: context.weather,
      npc: context.currentNpc,
      choices,
      effects,
    };
  }

  /** チェーンの次ステップを解決 */
  resolveChainNext(
    chainId: string,
    currentStep: number,
    context: EventContext,
  ): ResolvedEvent | null {
    const nextStep = currentStep + 1;
    const nextTemplate = this.chains.find(
      (t) => t.chainId === chainId && t.chainStep === nextStep,
    );

    if (!nextTemplate) {
      return null;
    }

    return this.resolveTemplate(nextTemplate, context);
  }

  /** レアイベント判定（5%の確率） */
  checkRareEvent(
    context: EventContext,
    rng?: () => number,
  ): ResolvedEvent | null {
    const roll = rng ? rng() : Math.random();
    if (roll >= 0.05) {
      return null;
    }

    // season でフィルタ（レアイベントは season が一致するもの優先、なければ全体から）
    const seasonRares = this.rareEvents.filter(
      (t) => t.season === context.season,
    );
    const candidates = seasonRares.length > 0 ? seasonRares : this.rareEvents;

    if (candidates.length === 0) {
      return null;
    }

    const template = candidates[Math.floor(Math.random() * candidates.length)];
    return this.resolveTemplate(template, context);
  }

  /** 好感度/称号依存の選択肢フィルタ */
  filterChoices(
    choices: EventChoice[],
    affinities: NPCAffinity[],
    titles: string[],
  ): EventChoice[] {
    return choices.filter((choice) => {
      // 好感度チェック
      if (choice.requiredAffinity) {
        const affinity = affinities.find(
          (a) => a.npcId === choice.requiredAffinity!.npcId,
        );
        if (
          !affinity ||
          affinity.level < choice.requiredAffinity.minLevel
        ) {
          return false;
        }
      }

      // 称号チェック
      if (choice.requiredTitle) {
        if (!titles.includes(choice.requiredTitle)) {
          return false;
        }
      }

      return true;
    });
  }

  /** 季節ベースの天候決定 */
  static determineWeather(season: Season, rng?: () => number): Weather {
    const roll = rng ? rng() : Math.random();

    // 春: sunny 50%, rainy 40%, snowy 10%
    // 夏: sunny 60%, rainy 35%, snowy 5%
    // 秋: sunny 40%, rainy 40%, snowy 20%
    // 冬: sunny 30%, rainy 20%, snowy 50%

    const thresholds: Record<Season, { sunnyMax: number; rainyMax: number }> = {
      spring: { sunnyMax: 0.5, rainyMax: 0.9 },
      summer: { sunnyMax: 0.6, rainyMax: 0.95 },
      autumn: { sunnyMax: 0.4, rainyMax: 0.8 },
      winter: { sunnyMax: 0.3, rainyMax: 0.5 },
    };

    const { sunnyMax, rainyMax } = thresholds[season];

    if (roll < sunnyMax) return "sunny";
    if (roll < rainyMax) return "rainy";
    return "snowy";
  }

  /** 2つの EventEffect をマージ（浅いマージ） */
  private mergeEffects(
    base: Partial<EventEffect>,
    modifier: Partial<EventEffect>,
  ): EventEffect {
    const result: EventEffect = { ...base };

    // happiness のマージ
    if (modifier.happiness) {
      result.happiness = result.happiness
        ? { ...result.happiness }
        : {};
      for (const [key, value] of Object.entries(modifier.happiness)) {
        const k = key as keyof typeof result.happiness;
        result.happiness[k] = (result.happiness[k] ?? 0) + (value ?? 0);
      }
    }

    // fatigue のマージ
    if (modifier.fatigue !== undefined) {
      result.fatigue = (result.fatigue ?? 0) + modifier.fatigue;
    }

    // insight のマージ
    if (modifier.insight !== undefined) {
      result.insight = (result.insight ?? 0) + modifier.insight;
    }

    // affinity のマージ
    if (modifier.affinity) {
      result.affinity = [...(result.affinity ?? []), ...modifier.affinity];
    }

    // romance の上書き（後勝ち）
    if (modifier.romance) {
      result.romance = modifier.romance;
    }

    // title の上書き（後勝ち）
    if (modifier.title) {
      result.title = modifier.title;
    }

    // chainNext の上書き（後勝ち）
    if (modifier.chainNext) {
      result.chainNext = modifier.chainNext;
    }

    return result;
  }
}
