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
import { SHORT_BOARD_LAYOUT } from "@/data/board-layout";
import { EVENT_TEMPLATES } from "@/data/event-templates";
import { EVENT_CHAINS } from "@/data/event-chains";
import { RARE_EVENTS } from "@/data/rare-events";
import { NPCS } from "@/data/npc-data";
import { processTurn } from "@/scenes/helpers/turn-logic";

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

  // UI elements
  private statusText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private logText!: Phaser.GameObjects.Text;
  private playerMarker!: Phaser.GameObjects.Graphics;
  private boardGraphics!: Phaser.GameObjects.Graphics;

  // Overlay container for events/choices
  private overlayContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { player: PlayerCharacter }): void {
    this.gameState = createInitialGameState(data.player);
    this.happinessSystem = new HappinessSystem();
    this.diceSystem = new DiceSystem();
    this.boardSystem = new BoardSystem(SHORT_BOARD_LAYOUT);
    this.eventSystem = new EventSystem(
      EVENT_TEMPLATES,
      EVENT_CHAINS,
      RARE_EVENTS,
      NPCS,
    );
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

    // Status panel (top area) - minimal text display
    this.statusText = this.add
      .text(10, 10, "", {
        fontSize: "14px",
        color: "#ffffff",
        wordWrap: { width: 400 },
      });

    this.turnText = this.add
      .text(GAME_WIDTH - 10, 10, "", {
        fontSize: "14px",
        color: "#aaaaaa",
      })
      .setOrigin(1, 0);

    // Prompt text (center)
    this.promptText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 60, "", {
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#333333aa",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setVisible(false);

    // Log text (bottom left)
    this.logText = this.add
      .text(10, GAME_HEIGHT - 30, "", {
        fontSize: "12px",
        color: "#888888",
      });

    // Overlay container for events/choices
    this.overlayContainer = this.add.container(0, 0);
    this.overlayContainer.setVisible(false);

    this.updateStatusDisplay();
    this.startTurnDicePhase();
  }

  private drawBoard(): void {
    this.boardGraphics.clear();
    const tiles = SHORT_BOARD_LAYOUT.tiles;

    // Scale and offset board to fit in game area
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

      // Tile border
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

    // Player dot
    this.playerMarker.fillStyle(0xffffff, 1);
    this.playerMarker.fillCircle(x, y, PLAYER_SIZE);
    this.playerMarker.lineStyle(2, 0x000000, 1);
    this.playerMarker.strokeCircle(x, y, PLAYER_SIZE);
  }

  private updateStatusDisplay(): void {
    const axes = HappinessSystem.toAxes(this.gameState.happiness);
    this.statusText.setText(
      `くらし: ${axes.kurashi} / つながり: ${axes.tsunagari} / じぶん: ${axes.jibun}` +
        `  疲労: ${this.gameState.fluctuation.fatigue} 閃き: ${this.gameState.fluctuation.insight}`,
    );

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
    this.showPrompt("タップしてサイコロを振る");

    // Wait for click to roll dice
    this.input.once("pointerdown", () => {
      const roll = this.diceSystem.roll();
      this.showPrompt(`サイコロ: ${roll}`);
      this.logText.setText(`${roll} が出た！`);

      this.time.delayedCall(800, () => {
        this.startMovePhase(roll);
      });
    });
  }

  private startMovePhase(diceRoll: number): void {
    this.gameState.turnPhase = "move";

    // Check if landing on a branch point
    const currentTileId = SHORT_BOARD_LAYOUT.tiles[this.gameState.currentTileIndex]?.id;
    if (!currentTileId) return;

    // Simulate movement to check if branch is encountered
    const previewTile = this.boardSystem.advance(currentTileId, diceRoll);

    if (this.boardSystem.isBranchPoint(previewTile.id)) {
      this.showRouteChoice(diceRoll, previewTile);
    } else {
      this.executeTurn(diceRoll);
    }
  }

  private showRouteChoice(diceRoll: number, _branchTile: Tile): void {
    this.hidePrompt();
    this.showOverlay();

    const routes: { label: string; value: BranchRoute }[] = [
      { label: "農園ルート (farm)", value: "farm" },
      { label: "商店ルート (shop)", value: "shop" },
      { label: "村ルート (village)", value: "village" },
    ];

    // Overlay title
    const title = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, "ルートを選んでください", {
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.overlayContainer.add(title);

    for (let i = 0; i < routes.length; i++) {
      const { label, value } = routes[i];
      const y = GAME_HEIGHT / 2 - 20 + i * 50;

      const btn = this.add
        .text(GAME_WIDTH / 2, y, label, {
          fontSize: "18px",
          color: "#ffffff",
          backgroundColor: "#4a6a8a",
          padding: { x: 20, y: 8 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      btn.on("pointerover", () => btn.setStyle({ backgroundColor: "#5a7a9a" }));
      btn.on("pointerout", () => btn.setStyle({ backgroundColor: "#4a6a8a" }));

      btn.on("pointerdown", () => {
        this.hideOverlay();
        this.executeTurn(diceRoll, value);
      });

      this.overlayContainer.add(btn);
    }
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

    // Update player marker with tween-like animation
    this.drawPlayerMarker();
    this.updateStatusDisplay();

    // Show event
    this.showEventOverlay(result.event, result.landedTile, result.isGameEnd);
  }

  private showEventOverlay(
    event: ResolvedEvent,
    _tile: Tile,
    isGameEnd: boolean,
  ): void {
    this.gameState.turnPhase = "event";
    this.showOverlay();

    // Event title
    const titleText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, event.title, {
        fontSize: "22px",
        color: "#ffdd44",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.overlayContainer.add(titleText);

    // Event description
    const descText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, event.description, {
        fontSize: "16px",
        color: "#ffffff",
        wordWrap: { width: 500 },
        align: "center",
      })
      .setOrigin(0.5);
    this.overlayContainer.add(descText);

    // NPC info
    if (event.npc) {
      const npcText = this.add
        .text(
          GAME_WIDTH / 2,
          GAME_HEIGHT / 2 - 20,
          `${event.npc.name} がいる`,
          {
            fontSize: "14px",
            color: "#aaddff",
          },
        )
        .setOrigin(0.5);
      this.overlayContainer.add(npcText);
    }

    // Choices
    if (event.choices.length > 0) {
      this.showChoices(event, isGameEnd);
    } else {
      // No choices - continue button
      this.addContinueButton(isGameEnd);
    }
  }

  private showChoices(event: ResolvedEvent, isGameEnd: boolean): void {
    const startY = GAME_HEIGHT / 2 + 20;

    for (let i = 0; i < event.choices.length; i++) {
      const choice = event.choices[i];
      const y = startY + i * 40;

      const btn = this.add
        .text(GAME_WIDTH / 2, y, choice.text, {
          fontSize: "16px",
          color: "#ffffff",
          backgroundColor: "#5a5a8a",
          padding: { x: 16, y: 6 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      btn.on("pointerover", () => btn.setStyle({ backgroundColor: "#6a6a9a" }));
      btn.on("pointerout", () => btn.setStyle({ backgroundColor: "#5a5a8a" }));

      btn.on("pointerdown", () => {
        // Apply choice effects by re-processing (simplified for now)
        this.logText.setText(`選択: ${choice.text}`);
        this.hideOverlay();
        this.settlementPhase(isGameEnd);
      });

      this.overlayContainer.add(btn);
    }
  }

  private addContinueButton(isGameEnd: boolean): void {
    const btn = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, "つぎへ", {
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#4a8a4a",
        padding: { x: 24, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => btn.setStyle({ backgroundColor: "#5a9a5a" }));
    btn.on("pointerout", () => btn.setStyle({ backgroundColor: "#4a8a4a" }));

    btn.on("pointerdown", () => {
      this.hideOverlay();
      this.settlementPhase(isGameEnd);
    });

    this.overlayContainer.add(btn);
  }

  private settlementPhase(isGameEnd: boolean): void {
    this.gameState.turnPhase = "settlement";
    this.updateStatusDisplay();

    if (isGameEnd || this.gameState.currentTurn > this.gameState.totalTurns) {
      // Transition to ResultScene
      this.time.delayedCall(500, () => {
        this.cameras.main.fadeOut(500);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("ResultScene", { gameState: this.gameState });
        });
      });
    } else {
      // Next turn
      this.time.delayedCall(300, () => {
        this.startTurnDicePhase();
      });
    }
  }

  private showPrompt(message: string): void {
    this.promptText.setText(message);
    this.promptText.setVisible(true);
  }

  private hidePrompt(): void {
    this.promptText.setVisible(false);
  }

  private showOverlay(): void {
    this.overlayContainer.removeAll(true);

    // Semi-transparent background
    const overlayBg = this.add.graphics();
    overlayBg.fillStyle(0x000000, 0.7);
    overlayBg.fillRect(
      GAME_WIDTH / 2 - 300,
      GAME_HEIGHT / 2 - 150,
      600,
      300,
    );
    overlayBg.lineStyle(2, 0xffffff, 0.5);
    overlayBg.strokeRect(
      GAME_WIDTH / 2 - 300,
      GAME_HEIGHT / 2 - 150,
      600,
      300,
    );
    this.overlayContainer.add(overlayBg);

    this.overlayContainer.setVisible(true);
    this.overlayContainer.setDepth(100);
  }

  private hideOverlay(): void {
    this.overlayContainer.removeAll(true);
    this.overlayContainer.setVisible(false);
  }
}
