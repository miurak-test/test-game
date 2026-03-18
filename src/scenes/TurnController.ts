import Phaser from "phaser";
import type {
  GameState,
  BranchRoute,
  ResolvedEvent,
  Tile,
} from "@/types";
import { HappinessSystem } from "@/systems/HappinessSystem";
import type { DiceSystem } from "@/systems/DiceSystem";
import type { BoardSystem } from "@/systems/BoardSystem";
import type { EventSystem } from "@/systems/EventSystem";
import type { RomanceSystem } from "@/systems/RomanceSystem";
import type { TitleSystem } from "@/systems/TitleSystem";
import type { TutorialSystem } from "@/systems/TutorialSystem";
import { SHORT_BOARD_LAYOUT } from "@/data/board-layout";
import { processTurn } from "@/scenes/helpers/turn-logic";

import type { StatusPanel } from "@/ui/StatusPanel";
import type { MiniLog } from "@/ui/MiniLog";
import type { DiceDisplay } from "@/ui/DiceDisplay";
import type { EventOverlay } from "@/ui/EventOverlay";
import type { ChoiceOverlay } from "@/ui/ChoiceOverlay";
import type { BoardRenderer } from "./BoardRenderer";

export interface TurnControllerDeps {
  scene: Phaser.Scene;
  boardRenderer: BoardRenderer;
  statusPanel: StatusPanel;
  miniLog: MiniLog;
  diceDisplay: DiceDisplay;
  eventOverlay: EventOverlay;
  choiceOverlay: ChoiceOverlay;
  turnText: Phaser.GameObjects.Text;
  tutorialText: Phaser.GameObjects.Text;
  happinessSystem: HappinessSystem;
  diceSystem: DiceSystem;
  boardSystem: BoardSystem;
  eventSystem: EventSystem;
  romanceSystem: RomanceSystem;
  titleSystem: TitleSystem;
  tutorialSystem: TutorialSystem;
}

export class TurnController {
  private scene: Phaser.Scene;
  private boardRenderer: BoardRenderer;
  private statusPanel: StatusPanel;
  private miniLog: MiniLog;
  private diceDisplay: DiceDisplay;
  private eventOverlay: EventOverlay;
  private choiceOverlay: ChoiceOverlay;
  private turnText: Phaser.GameObjects.Text;
  private tutorialText: Phaser.GameObjects.Text;
  private happinessSystem: HappinessSystem;
  private diceSystem: DiceSystem;
  private boardSystem: BoardSystem;
  private eventSystem: EventSystem;
  private romanceSystem: RomanceSystem;
  private titleSystem: TitleSystem;
  private tutorialSystem: TutorialSystem;

  private gameState: GameState;

  constructor(deps: TurnControllerDeps, gameState: GameState) {
    this.scene = deps.scene;
    this.boardRenderer = deps.boardRenderer;
    this.statusPanel = deps.statusPanel;
    this.miniLog = deps.miniLog;
    this.diceDisplay = deps.diceDisplay;
    this.eventOverlay = deps.eventOverlay;
    this.choiceOverlay = deps.choiceOverlay;
    this.turnText = deps.turnText;
    this.tutorialText = deps.tutorialText;
    this.happinessSystem = deps.happinessSystem;
    this.diceSystem = deps.diceSystem;
    this.boardSystem = deps.boardSystem;
    this.eventSystem = deps.eventSystem;
    this.romanceSystem = deps.romanceSystem;
    this.titleSystem = deps.titleSystem;
    this.tutorialSystem = deps.tutorialSystem;
    this.gameState = gameState;
  }

  getGameState(): GameState {
    return this.gameState;
  }

  /** Check tutorial at the start of the game, then begin dice phase */
  checkTutorialAndStart(): void {
    this.updateTurnDisplay();
    const step = this.tutorialSystem.checkTrigger(this.gameState);
    if (step) {
      this.showTutorialMessage(step.message, () => {
        this.tutorialSystem.completeStep(step.id);
        this.startTurnDicePhase();
      });
    } else {
      this.startTurnDicePhase();
    }
  }

  showTutorialMessage(message: string, onDismiss: () => void): void {
    this.tutorialText.setText(message);
    this.tutorialText.setVisible(true);

    this.scene.input.once("pointerdown", () => {
      this.tutorialText.setVisible(false);
      onDismiss();
    });
  }

  private updateTurnDisplay(): void {
    this.turnText.setText(
      `\u30BF\u30FC\u30F3 ${this.gameState.currentTurn}/${this.gameState.totalTurns}` +
        `  ${this.getSeasonLabel(this.gameState.currentSeason)}`,
    );
  }

  private getSeasonLabel(season: string): string {
    const labels: Record<string, string> = {
      spring: "\u6625",
      summer: "\u590f",
      autumn: "\u79cb",
      winter: "\u51ac",
    };
    return labels[season] ?? season;
  }

  private startTurnDicePhase(): void {
    this.gameState.turnPhase = "dice";
    this.diceDisplay.showValue(1);

    // Wait for click to roll dice
    this.scene.input.once("pointerdown", () => {
      const roll = this.diceSystem.roll();

      // Animate the dice, then proceed
      this.diceDisplay.animateRoll(roll).then(() => {
        this.scene.time.delayedCall(400, () => {
          this.startMovePhase(roll);
        });
      });
    });
  }

  private startMovePhase(diceRoll: number): void {
    this.gameState.turnPhase = "move";

    const currentTileId =
      SHORT_BOARD_LAYOUT.tiles[this.gameState.currentTileIndex]?.id;
    if (!currentTileId) return;

    // Preview where the player will land
    const previewTile = this.boardSystem.advance(currentTileId, diceRoll);

    if (this.boardSystem.isBranchPoint(previewTile.id)) {
      // Check tutorial for first branch
      const step = this.tutorialSystem.checkTrigger(
        this.gameState,
        undefined,
        true,
      );
      if (step) {
        this.showTutorialMessage(step.message, () => {
          this.tutorialSystem.completeStep(step.id);
          this.showRouteChoice(diceRoll);
        });
      } else {
        this.showRouteChoice(diceRoll);
      }
    } else {
      this.executeTurn(diceRoll);
    }
  }

  private showRouteChoice(diceRoll: number): void {
    const routes: { label: string; value: BranchRoute }[] = [
      { label: "\u8FB2\u5712\u30EB\u30FC\u30C8 (farm)", value: "farm" },
      { label: "\u5546\u5E97\u30EB\u30FC\u30C8 (shop)", value: "shop" },
      { label: "\u6751\u30EB\u30FC\u30C8 (village)", value: "village" },
    ];

    const choices = routes.map((r) => ({
      id: r.value,
      text: r.label,
      effects: {},
    }));

    this.choiceOverlay.showChoices(choices).then((selectedId) => {
      this.executeTurn(diceRoll, selectedId as BranchRoute);
    });
  }

  private executeTurn(diceRoll: number, routeChoice?: BranchRoute): void {
    const result = processTurn(
      this.gameState,
      diceRoll,
      this.boardSystem,
      this.eventSystem,
      this.happinessSystem,
      routeChoice,
    );

    this.gameState = result.newState;

    // Update board marker
    this.boardRenderer.updatePlayerPosition(this.gameState.currentTileIndex);
    this.updateTurnDisplay();

    // Update romance system for romance tiles
    if (result.landedTile.type === "romance" && result.event.npc) {
      const npcId = result.event.npc.id;
      this.gameState.affinities = this.romanceSystem.updateAffinity(
        this.gameState.affinities,
        npcId,
        5,
      );
      const aff = this.gameState.affinities.find((a) => a.npcId === npcId);
      if (aff) {
        const updated = this.romanceSystem.updateRomanceLevel(aff, true);
        this.gameState.affinities = this.gameState.affinities.map((a) =>
          a.npcId === npcId ? updated : a,
        );
      }
    }

    // Show event overlay
    this.showEventPhase(result.event, result.landedTile, result.isGameEnd);
  }

  private showEventPhase(
    event: ResolvedEvent,
    _tile: Tile,
    isGameEnd: boolean,
  ): void {
    this.gameState.turnPhase = "event";

    // Show event overlay
    this.eventOverlay.show(event).then(() => {
      // After event is dismissed, check for choices
      if (event.choices.length > 0) {
        // Check tutorial for first choice
        const step = this.tutorialSystem.checkTrigger(
          this.gameState,
          event,
        );
        if (step) {
          this.showTutorialMessage(step.message, () => {
            this.tutorialSystem.completeStep(step.id);
            this.showEventChoices(event, isGameEnd);
          });
        } else {
          this.showEventChoices(event, isGameEnd);
        }
      } else {
        this.settlementPhase(event, isGameEnd);
      }
    });
  }

  private showEventChoices(
    event: ResolvedEvent,
    isGameEnd: boolean,
  ): void {
    this.choiceOverlay.showChoices(event.choices).then((_selectedChoiceId) => {
      this.settlementPhase(event, isGameEnd);
    });
  }

  private settlementPhase(lastEvent: ResolvedEvent, isGameEnd: boolean): void {
    this.gameState.turnPhase = "settlement";

    // Update StatusPanel
    const axes = HappinessSystem.toAxes(this.gameState.happiness);
    this.statusPanel.updateAxes(axes);
    this.statusPanel.updateFluctuation(this.gameState.fluctuation);

    // Update MiniLog with the latest happiness log
    const latestLog =
      this.gameState.happinessLog[this.gameState.happinessLog.length - 1];
    if (latestLog) {
      this.miniLog.addEntry(latestLog);
    }

    // Check for new titles
    const newTitles = this.titleSystem.checkNewTitles(
      this.gameState.happiness,
      this.gameState.affinities,
      this.gameState.eventHistory,
      this.gameState.earnedTitles,
    );

    for (const title of newTitles) {
      this.gameState.earnedTitles.push(title.id);
    }

    // Check tutorial triggers based on last event
    const tutorialStep = this.tutorialSystem.checkTrigger(
      this.gameState,
      lastEvent,
    );

    if (isGameEnd || this.gameState.currentTurn > this.gameState.totalTurns) {
      // Show title notification briefly, then transition to ResultScene
      if (newTitles.length > 0) {
        const titleMsg = newTitles
          .map((t) => `\u79F0\u53F7\u7372\u5F97: ${t.name}`)
          .join("\n");
        this.showTutorialMessage(titleMsg, () => {
          this.transitionToResult();
        });
      } else {
        this.transitionToResult();
      }
    } else {
      // Show title notification or tutorial, then start next turn
      if (newTitles.length > 0) {
        const titleMsg = newTitles
          .map((t) => `\u79F0\u53F7\u7372\u5F97: ${t.name}`)
          .join("\n");
        this.showTutorialMessage(titleMsg, () => {
          if (tutorialStep) {
            this.showTutorialMessage(tutorialStep.message, () => {
              this.tutorialSystem.completeStep(tutorialStep.id);
              this.startTurnDicePhase();
            });
          } else {
            this.startTurnDicePhase();
          }
        });
      } else if (tutorialStep) {
        this.showTutorialMessage(tutorialStep.message, () => {
          this.tutorialSystem.completeStep(tutorialStep.id);
          this.startTurnDicePhase();
        });
      } else {
        this.scene.time.delayedCall(300, () => {
          this.startTurnDicePhase();
        });
      }
    }
  }

  private transitionToResult(): void {
    this.scene.time.delayedCall(500, () => {
      this.scene.cameras.main.fadeOut(500);
      this.scene.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.scene.start("ResultScene", { gameState: this.gameState });
      });
    });
  }
}
