import type { GameState, ResolvedEvent } from "@/types";

export interface TutorialStep {
  id: string;
  trigger: TutorialTrigger;
  message: string;
  highlightTarget?: string;
}

export type TutorialTrigger =
  | { type: "turn"; turn: number }
  | { type: "first_positive_event" }
  | { type: "first_negative_event" }
  | { type: "fatigue_threshold"; value: number }
  | { type: "first_branch" }
  | { type: "first_choice" };

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    trigger: { type: "turn", turn: 1 },
    message:
      "ようこそ！サイコロを振って、マスに止まると出来事が起きるよ。\n幸福度を高めて、素敵な1年を過ごそう！",
  },
  {
    id: "fatigue_intro",
    trigger: { type: "first_positive_event" },
    message:
      "良いことが続くと「疲労」がたまるよ。\n疲労がたまると幸福度が上がりにくくなるから、休憩も大事！",
  },
  {
    id: "insight_intro",
    trigger: { type: "first_negative_event" },
    message:
      "大変なことがあっても「洞察」として学びになるよ。\n洞察が高まると、創造や文化の幸福が上がりやすくなるんだ。",
  },
  {
    id: "branch_intro",
    trigger: { type: "first_branch" },
    message:
      "分岐点！ルートを選ぼう。\n農業→疲労が軽い  お店→お金UP  村づくり→洞察UP",
  },
  {
    id: "fatigue_warning",
    trigger: { type: "fatigue_threshold", value: 3 },
    message: "疲労がたまってきたよ！休憩マスに止まると回復できるよ。",
  },
];

export class TutorialSystem {
  private completedSteps: Set<string> = new Set();
  private active: boolean;

  constructor(isFirstPlay: boolean) {
    this.active = isFirstPlay;
  }

  /** Check if any tutorial step should trigger based on current state */
  checkTrigger(
    state: GameState,
    lastEvent?: ResolvedEvent,
    isBranch?: boolean,
  ): TutorialStep | null {
    if (!this.active) return null;

    for (const step of TUTORIAL_STEPS) {
      if (this.completedSteps.has(step.id)) continue;
      if (this.matchesTrigger(step.trigger, state, lastEvent, isBranch)) {
        return step;
      }
    }

    return null;
  }

  /** Mark a step as completed */
  completeStep(stepId: string): void {
    this.completedSteps.add(stepId);
  }

  /** Check if all tutorial steps have been completed */
  isComplete(): boolean {
    return this.completedSteps.size >= TUTORIAL_STEPS.length;
  }

  private matchesTrigger(
    trigger: TutorialTrigger,
    state: GameState,
    lastEvent?: ResolvedEvent,
    isBranch?: boolean,
  ): boolean {
    switch (trigger.type) {
      case "turn":
        return state.currentTurn === trigger.turn;

      case "first_positive_event": {
        if (!lastEvent?.effects.happiness) return false;
        return Object.values(lastEvent.effects.happiness).some(
          (v) => (v ?? 0) > 0,
        );
      }

      case "first_negative_event": {
        if (!lastEvent?.effects.happiness) return false;
        return Object.values(lastEvent.effects.happiness).some(
          (v) => (v ?? 0) < 0,
        );
      }

      case "fatigue_threshold":
        return state.fluctuation.fatigue >= trigger.value;

      case "first_branch":
        return isBranch === true;

      case "first_choice":
        return (lastEvent?.choices.length ?? 0) > 0;

      default:
        return false;
    }
  }
}
