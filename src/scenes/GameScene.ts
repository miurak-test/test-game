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
  life: 0x5a8a5a,
  choice: 0xd4a35a,
  branch: 0xc85a5a,
  festival: 0x8a5aaa,
  rest: 0x5a7aaa,
  happening: 0xccc45a,
  romance: 0xc85a8a,
};

/** Tile type to emoji icon mapping */
const TILE_ICONS: Record<string, string> = {
  life: "\u{1f331}",
  choice: "\u2753",
  branch: "\u{1f500}",
  festival: "\u{1f389}",
  rest: "\u{1f4a4}",
  happening: "\u26a1",
  romance: "\u{1f495}",
};

/** Season background zone colors */
const SEASON_ZONE_COLORS: Record<string, number> = {
  spring: 0xff9eb1,
  summer: 0x7ec8e3,
  autumn: 0xffcb77,
  winter: 0xc8b6e2,
};

/** Season labels with emoji */
const SEASON_LABELS: Record<string, string> = {
  spring: "\u{1f338} \u6625",
  summer: "\u{1f33b} \u590f",
  autumn: "\u{1f342} \u79cb",
  winter: "\u2744\ufe0f \u51ac",
};

/** Season zone Y ranges for background rendering */
const SEASON_ZONES: Record<string, { y: number; h: number }> = {
  spring: { y: 40, h: 140 },
  summer: { y: 160, h: 140 },
  autumn: { y: 280, h: 140 },
  winter: { y: 400, h: 140 },
};

/** Route line colors for branch paths */
const ROUTE_LINE_COLORS: Record<string, number> = {
  farm: 0x5a8a5a,
  shop: 0xd4a35a,
  village: 0x8a5aaa,
};

const TILE_SIZE = 28;
const PLAYER_SIZE = 10;

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
  private boardTexts: Phaser.GameObjects.Text[] = [];

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
    bg.fillStyle(0x2b2b3a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw the board
    this.boardGraphics = this.add.graphics();
    this.drawBoard();

    // Player marker
    this.playerMarker = this.add.graphics();
    this.drawPlayerMarker();
    this.setupPlayerPulse();

    // StatusPanel (top area)
    this.statusPanel = new StatusPanel(this, 10, 8);
    const axes = HappinessSystem.toAxes(this.gameState.happiness);
    this.statusPanel.updateAxes(axes);
    this.statusPanel.updateFluctuation(this.gameState.fluctuation);

    // Turn info (top right)
    this.turnText = this.add
      .text(GAME_WIDTH - 10, 10, "", {
        fontSize: "14px",
        fontFamily: '"DotGothic16", monospace',
        color: "#f5e6d3",
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
        fontFamily: '"DotGothic16", monospace',
        color: "#f5e6d3",
        backgroundColor: "#4a4a68",
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

    // Clean up previous board texts
    for (const txt of this.boardTexts) {
      txt.destroy();
    }
    this.boardTexts = [];

    const tiles = SHORT_BOARD_LAYOUT.tiles;

    // (a) Season background zones
    for (const season of ["spring", "summer", "autumn", "winter"] as const) {
      const zone = SEASON_ZONES[season];
      const zoneColor = SEASON_ZONE_COLORS[season];
      this.boardGraphics.fillStyle(zoneColor, 0.25);
      this.boardGraphics.fillRoundedRect(10, zone.y, GAME_WIDTH - 20, zone.h, 8);

      // Season label
      const label = this.add
        .text(18, zone.y + 4, SEASON_LABELS[season], {
          fontSize: "10px",
          fontFamily: '"DotGothic16", monospace',
          color: "#f5e6d3",
        })
        .setDepth(5);
      this.boardTexts.push(label);
    }

    // (b) Connection lines

    // Define main-path connections per season
    // Spring: left->right
    const springMainPath = ["sp-life-1", "sp-romance", "sp-branch"];
    const springRoutes = {
      farm: ["sp-branch", "sp-farm-1", "sp-farm-2", "sp-festival"],
      shop: ["sp-branch", "sp-shop-1", "sp-shop-2", "sp-festival"],
      village: ["sp-branch", "sp-village-1", "sp-village-2", "sp-festival"],
    };

    // Summer: right->left
    const summerMainPath = ["su-life-1", "su-happening", "su-branch"];
    const summerRoutes = {
      farm: ["su-branch", "su-farm-1", "su-farm-2", "su-festival"],
      shop: ["su-branch", "su-shop-1", "su-shop-2", "su-festival"],
      village: ["su-branch", "su-village-1", "su-village-2", "su-festival"],
    };

    // Autumn: left->right
    const autumnMainPath = ["au-life-1", "au-choice", "au-branch"];
    const autumnRoutes = {
      farm: ["au-branch", "au-farm-1", "au-farm-2", "au-festival"],
      shop: ["au-branch", "au-shop-1", "au-shop-2", "au-festival"],
      village: ["au-branch", "au-village-1", "au-village-2", "au-festival"],
    };

    // Winter: right->left
    const winterMainPath = ["wi-life-1", "wi-romance", "wi-branch"];
    const winterRoutes = {
      farm: ["wi-branch", "wi-farm-1", "wi-farm-2", "wi-festival"],
      shop: ["wi-branch", "wi-shop-1", "wi-shop-2", "wi-festival"],
      village: ["wi-branch", "wi-village-1", "wi-village-2", "wi-festival"],
    };

    // Cross-season connections (dotted lines)
    const crossSeasonLinks: [string, string][] = [
      ["sp-festival", "su-life-1"],
      ["su-festival", "au-life-1"],
      ["au-festival", "wi-life-1"],
    ];

    const tileMap = new Map(tiles.map((t) => [t.id, t]));

    // Helper to draw a path of connected tiles
    const drawPath = (
      path: string[],
      lineWidth: number,
      color: number,
      alpha: number,
    ) => {
      for (let i = 0; i < path.length - 1; i++) {
        const from = tileMap.get(path[i]);
        const to = tileMap.get(path[i + 1]);
        if (!from || !to) continue;
        this.boardGraphics.lineStyle(lineWidth, color, alpha);
        this.boardGraphics.lineBetween(
          from.position.x,
          from.position.y,
          to.position.x,
          to.position.y,
        );
      }
    };

    // Draw main paths (white, thick)
    drawPath(springMainPath, 3, 0xffffff, 0.7);
    drawPath(summerMainPath, 3, 0xffffff, 0.7);
    drawPath(autumnMainPath, 3, 0xffffff, 0.7);
    drawPath(winterMainPath, 3, 0xffffff, 0.7);

    // Draw branch routes (colored, thinner)
    const allRoutes = [springRoutes, summerRoutes, autumnRoutes, winterRoutes];
    for (const seasonRoutes of allRoutes) {
      for (const [route, path] of Object.entries(seasonRoutes)) {
        const routeColor = ROUTE_LINE_COLORS[route] ?? 0xffffff;
        drawPath(path, 2, routeColor, 0.5);
      }
    }

    // Draw cross-season connections (dashed look via dotted segments)
    for (const [fromId, toId] of crossSeasonLinks) {
      const from = tileMap.get(fromId);
      const to = tileMap.get(toId);
      if (!from || !to) continue;

      // Draw dashed line with segments
      const segments = 8;
      const dx = to.position.x - from.position.x;
      const dy = to.position.y - from.position.y;
      for (let s = 0; s < segments; s += 2) {
        const sx = from.position.x + (dx * s) / segments;
        const sy = from.position.y + (dy * s) / segments;
        const ex = from.position.x + (dx * (s + 1)) / segments;
        const ey = from.position.y + (dy * (s + 1)) / segments;
        this.boardGraphics.lineStyle(2, 0xffffff, 0.3);
        this.boardGraphics.lineBetween(sx, sy, ex, ey);
      }
    }

    // (c) Draw tiles
    for (const tile of tiles) {
      const x = tile.position.x;
      const y = tile.position.y;
      const color = TILE_COLORS[tile.type] ?? 0xaaaaaa;

      // Shadow (offset slightly down-right)
      this.boardGraphics.fillStyle(0x000000, 0.25);
      this.boardGraphics.fillRoundedRect(
        x - TILE_SIZE + 2,
        y - TILE_SIZE + 2,
        TILE_SIZE * 2,
        TILE_SIZE * 2,
        5,
      );

      // Tile background
      this.boardGraphics.fillStyle(color, 0.85);
      this.boardGraphics.fillRoundedRect(
        x - TILE_SIZE,
        y - TILE_SIZE,
        TILE_SIZE * 2,
        TILE_SIZE * 2,
        5,
      );

      // Tile border
      this.boardGraphics.lineStyle(1, 0xffffff, 0.4);
      this.boardGraphics.strokeRoundedRect(
        x - TILE_SIZE,
        y - TILE_SIZE,
        TILE_SIZE * 2,
        TILE_SIZE * 2,
        5,
      );

      // Tile icon
      const icon = TILE_ICONS[tile.type] ?? "";
      if (icon) {
        const iconText = this.add
          .text(x, y, icon, {
            fontSize: "16px",
          })
          .setOrigin(0.5)
          .setDepth(10);
        this.boardTexts.push(iconText);
      }
    }

    // (d) START / GOAL markers
    const firstTile = tiles[0];
    const lastTile = tiles[tiles.length - 1];

    if (firstTile) {
      const startText = this.add
        .text(firstTile.position.x - TILE_SIZE - 4, firstTile.position.y, "START", {
          fontSize: "10px",
          fontFamily: '"DotGothic16", monospace',
          color: "#ffe66d",
          fontStyle: "bold",
        })
        .setOrigin(1, 0.5)
        .setDepth(10);
      this.boardTexts.push(startText);
    }

    if (lastTile) {
      const goalText = this.add
        .text(lastTile.position.x - TILE_SIZE - 4, lastTile.position.y, "GOAL", {
          fontSize: "10px",
          fontFamily: '"DotGothic16", monospace',
          color: "#ffe66d",
          fontStyle: "bold",
        })
        .setOrigin(1, 0.5)
        .setDepth(10);
      this.boardTexts.push(goalText);
    }
  }

  private drawPlayerMarker(): void {
    this.playerMarker.clear();
    const tiles = SHORT_BOARD_LAYOUT.tiles;
    const currentTile = tiles[this.gameState.currentTileIndex];
    if (!currentTile) return;

    const x = currentTile.position.x;
    const y = currentTile.position.y;

    this.playerMarker.fillStyle(0xffffff, 1);
    this.playerMarker.fillCircle(x, y, PLAYER_SIZE);
    this.playerMarker.lineStyle(2, 0x000000, 1);
    this.playerMarker.strokeCircle(x, y, PLAYER_SIZE);
    this.playerMarker.setDepth(20);
  }

  /** Set up pulse animation for the player marker (called once in create) */
  private setupPlayerPulse(): void {
    this.tweens.add({
      targets: this.playerMarker,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
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
