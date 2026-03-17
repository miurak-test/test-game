import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "@/constants";
import type {
  PlayerCharacter,
  GameState,
  BranchRoute,
  ResolvedEvent,
  Tile,
} from "@/types";
import { createInitialGameState } from "@/types";
import { HappinessSystem } from "@/systems/HappinessSystem";
import { DiceSystem } from "@/systems/DiceSystem";
import { BoardSystem } from "@/systems/BoardSystem";
import { EventSystem } from "@/systems/EventSystem";
import { RomanceSystem } from "@/systems/RomanceSystem";
import { TitleSystem } from "@/systems/TitleSystem";
import { TutorialSystem } from "@/systems/TutorialSystem";
import { SHORT_BOARD_LAYOUT } from "@/data/board-layout";
import { EVENT_TEMPLATES } from "@/data/event-templates";
import { EVENT_CHAINS } from "@/data/event-chains";
import { RARE_EVENTS } from "@/data/rare-events";
import { NPCS } from "@/data/npc-data";
import { TITLE_DEFINITIONS } from "@/data/title-definitions";
import { processTurn } from "@/scenes/helpers/turn-logic";

import { StatusPanel } from "@/ui/StatusPanel";
import { MiniLog } from "@/ui/MiniLog";
import { DiceDisplay } from "@/ui/DiceDisplay";
import { EventOverlay } from "@/ui/EventOverlay";
import { ChoiceOverlay } from "@/ui/ChoiceOverlay";

/** Tile type to color mapping for board rendering */
const TILE_COLORS: Record<string, number> = {
  life: 0x66bb6a,
  choice: 0xffa726,
  branch: 0xef5350,
  festival: 0xab47bc,
  rest: 0x42a5f5,
  happening: 0xffee58,
  romance: 0xec407a,
};

const TILE_SIZE = 14;
const PLAYER_SIZE = 8;

export class GameScene extends Phaser.Scene {
  private gameState!: GameState;
  private happinessSystem!: HappinessSystem;
  private diceSystem!: DiceSystem;
  private boardSystem!: BoardSystem;
  private eventSystem!: EventSystem;
  private romanceSystem!: RomanceSystem;
  private titleSystem!: TitleSystem;
  private tutorialSystem!: TutorialSystem;

  // UI components
  private statusPanel!: StatusPanel;
  private miniLog!: MiniLog;
  private diceDisplay!: DiceDisplay;
  private eventOverlay!: EventOverlay;
  private choiceOverlay!: ChoiceOverlay;

  // Board rendering
  private turnText!: Phaser.GameObjects.Text;
  private tutorialText!: Phaser.GameObjects.Text;
  private playerMarker!: Phaser.GameObjects.Graphics;
  private boardGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { player: PlayerCharacter }): void {
    const initialState = createInitialGameState(data.player);

    // Initialize affinities using RomanceSystem
    initialState.affinities = RomanceSystem.createInitialAffinities(NPCS);

    this.gameState = initialState;
    this.happinessSystem = new HappinessSystem();
    this.diceSystem = new DiceSystem();
    this.boardSystem = new BoardSystem(SHORT_BOARD_LAYOUT);
    this.eventSystem = new EventSystem(
      EVENT_TEMPLATES,
      EVENT_CHAINS,
      RARE_EVENTS,
      NPCS,
    );
    this.romanceSystem = new RomanceSystem();
    this.titleSystem = new TitleSystem(TITLE_DEFINITIONS);
    this.tutorialSystem = new TutorialSystem(this.gameState.isFirstPlay);
  }

  create(): void {
    this.cameras.main.fadeIn(300);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a2a1a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw the board
    this.boardGraphics = this.add.graphics();
    this.drawBoard();

    // Player marker
    this.playerMarker = this.add.graphics();
    this.drawPlayerMarker();

    // StatusPanel (top area)
    this.statusPanel = new StatusPanel(this, 10, 8);
    const axes = HappinessSystem.toAxes(this.gameState.happiness);
    this.statusPanel.updateAxes(axes);
    this.statusPanel.updateFluctuation(this.gameState.fluctuation);

    // Turn info (top right)
    this.turnText = this.add
      .text(GAME_WIDTH - 10, 10, "", {
        fontSize: "14px",
        color: "#aaaaaa",
      })
      .setOrigin(1, 0);

    // MiniLog (bottom left)
    this.miniLog = new MiniLog(this, 10, GAME_HEIGHT - 118);

    // DiceDisplay (bottom right)
    this.diceDisplay = new DiceDisplay(this, GAME_WIDTH - 60, GAME_HEIGHT - 60);

    // EventOverlay (centered)
    this.eventOverlay = new EventOverlay(this);

    // ChoiceOverlay (centered, higher depth)
    this.choiceOverlay = new ChoiceOverlay(this);

    // Tutorial text (center, hidden by default)
    this.tutorialText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "", {
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#336633cc",
        padding: { x: 16, y: 10 },
        wordWrap: { width: 500 },
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(120)
      .setVisible(false);

    this.updateTurnDisplay();
    this.checkTutorialAndStart();
  }

  /** Check tutorial at the start of the game, then begin dice phase */
  private checkTutorialAndStart(): void {
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

  private showTutorialMessage(message: string, onDismiss: () => void): void {
    this.tutorialText.setText(message);
    this.tutorialText.setVisible(true);

    this.input.once("pointerdown", () => {
      this.tutorialText.setVisible(false);
      onDismiss();
    });
  }

  private drawBoard(): void {
    this.boardGraphics.clear();
    const tiles = SHORT_BOARD_LAYOUT.tiles;

    const offsetX = 30;
    const offsetY = 50;
    const scaleX = 1.4;
    const scaleY = 0.8;

    for (const tile of tiles) {
      const x = offsetX + tile.position.x * scaleX;
      const y = offsetY + tile.position.y * scaleY;
      const color = TILE_COLORS[tile.type] ?? 0xaaaaaa;

      this.boardGraphics.fillStyle(color, 0.8);
      this.boardGraphics.fillRoundedRect(
        x - TILE_SIZE,
        y - TILE_SIZE,
        TILE_SIZE * 2,
        TILE_SIZE * 2,
        4,
      );

      this.boardGraphics.lineStyle(1, 0xffffff, 0.3);
      this.boardGraphics.strokeRoundedRect(
        x - TILE_SIZE,
        y - TILE_SIZE,
        TILE_SIZE * 2,
        TILE_SIZE * 2,
        4,
      );
    }
  }

  private drawPlayerMarker(): void {
    this.playerMarker.clear();
    const tiles = SHORT_BOARD_LAYOUT.tiles;
    const currentTile = tiles[this.gameState.currentTileIndex];
    if (!currentTile) return;

    const offsetX = 30;
    const offsetY = 50;
    const scaleX = 1.4;
    const scaleY = 0.8;

    const x = offsetX + currentTile.position.x * scaleX;
    const y = offsetY + currentTile.position.y * scaleY;

    this.playerMarker.fillStyle(0xffffff, 1);
    this.playerMarker.fillCircle(x, y, PLAYER_SIZE);
    this.playerMarker.lineStyle(2, 0x000000, 1);
    this.playerMarker.strokeCircle(x, y, PLAYER_SIZE);
  }

  private updateTurnDisplay(): void {
    this.turnText.setText(
      `ターン ${this.gameState.currentTurn}/${this.gameState.totalTurns}` +
        `  ${this.getSeasonLabel(this.gameState.currentSeason)}`,
    );
  }

  private getSeasonLabel(season: string): string {
    const labels: Record<string, string> = {
      spring: "春",
      summer: "夏",
      autumn: "秋",
      winter: "冬",
    };
    return labels[season] ?? season;
  }

  private startTurnDicePhase(): void {
    this.gameState.turnPhase = "dice";
    this.diceDisplay.showValue(1);

    // Wait for click to roll dice
    this.input.once("pointerdown", () => {
      const roll = this.diceSystem.roll();

      // Animate the dice, then proceed
      this.diceDisplay.animateRoll(roll).then(() => {
        this.time.delayedCall(400, () => {
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
      { label: "農園ルート (farm)", value: "farm" },
      { label: "商店ルート (shop)", value: "shop" },
      { label: "村ルート (village)", value: "village" },
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
    this.drawPlayerMarker();
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
          .map((t) => `称号獲得: ${t.name}`)
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
          .map((t) => `称号獲得: ${t.name}`)
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
        this.time.delayedCall(300, () => {
          this.startTurnDicePhase();
        });
      }
    }
  }

  private transitionToResult(): void {
    this.time.delayedCall(500, () => {
      this.cameras.main.fadeOut(500);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("ResultScene", { gameState: this.gameState });
      });
    });
  }
}
