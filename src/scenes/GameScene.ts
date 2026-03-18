import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "@/constants";
import type { PlayerCharacter, GameState } from "@/types";
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
import { StatusPanel } from "@/ui/StatusPanel";
import { MiniLog } from "@/ui/MiniLog";
import { DiceDisplay } from "@/ui/DiceDisplay";
import { EventOverlay } from "@/ui/EventOverlay";
import { ChoiceOverlay } from "@/ui/ChoiceOverlay";
import { BoardRenderer } from "./BoardRenderer";
import { TurnController } from "./TurnController";

export class GameScene extends Phaser.Scene {
  private initialState!: GameState;
  private happinessSystem!: HappinessSystem;
  private diceSystem!: DiceSystem;
  private boardSystem!: BoardSystem;
  private eventSystem!: EventSystem;
  private romanceSystem!: RomanceSystem;
  private titleSystem!: TitleSystem;
  private tutorialSystem!: TutorialSystem;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { player: PlayerCharacter }): void {
    this.initialState = createInitialGameState(data.player);
    this.initialState.affinities = RomanceSystem.createInitialAffinities(NPCS);
    this.happinessSystem = new HappinessSystem();
    this.diceSystem = new DiceSystem();
    this.boardSystem = new BoardSystem(SHORT_BOARD_LAYOUT);
    this.eventSystem = new EventSystem(EVENT_TEMPLATES, EVENT_CHAINS, RARE_EVENTS, NPCS);
    this.romanceSystem = new RomanceSystem();
    this.titleSystem = new TitleSystem(TITLE_DEFINITIONS);
    this.tutorialSystem = new TutorialSystem(this.initialState.isFirstPlay);
  }

  create(): void {
    this.cameras.main.fadeIn(300);
    const bg = this.add.graphics();
    bg.fillStyle(0x2b2b3a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const boardRenderer = new BoardRenderer(this, SHORT_BOARD_LAYOUT);
    boardRenderer.create();

    const statusPanel = new StatusPanel(this, 10, 8);
    statusPanel.updateAxes(HappinessSystem.toAxes(this.initialState.happiness));
    statusPanel.updateFluctuation(this.initialState.fluctuation);

    const turnText = this.add
      .text(GAME_WIDTH - 10, 10, "", {
        fontSize: "14px",
        fontFamily: '"DotGothic16", monospace',
        color: "#f5e6d3",
      })
      .setOrigin(1, 0);

    const tutorialText = this.add
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

    const turnController = new TurnController(
      {
        scene: this,
        boardRenderer,
        statusPanel,
        miniLog: new MiniLog(this, 10, GAME_HEIGHT - 118),
        diceDisplay: new DiceDisplay(this, GAME_WIDTH - 60, GAME_HEIGHT - 60),
        eventOverlay: new EventOverlay(this),
        choiceOverlay: new ChoiceOverlay(this),
        turnText,
        tutorialText,
        happinessSystem: this.happinessSystem,
        diceSystem: this.diceSystem,
        boardSystem: this.boardSystem,
        eventSystem: this.eventSystem,
        romanceSystem: this.romanceSystem,
        titleSystem: this.titleSystem,
        tutorialSystem: this.tutorialSystem,
      },
      this.initialState,
    );

    turnController.checkTutorialAndStart();
  }
}
