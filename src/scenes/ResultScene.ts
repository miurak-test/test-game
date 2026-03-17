import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "@/constants";
import type { GameState } from "@/types";
import { HappinessSystem } from "@/systems/HappinessSystem";
import { YearbookMini } from "@/ui/YearbookMini";
import { TITLE_DEFINITIONS } from "@/data/title-definitions";

export class ResultScene extends Phaser.Scene {
  private gameState!: GameState;

  constructor() {
    super({ key: "ResultScene" });
  }

  init(data: { gameState: GameState }): void {
    this.gameState = data.gameState;
  }

  create(): void {
    this.cameras.main.fadeIn(500);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x2b2b3a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // RPG window panel for score area
    const panel = this.add.graphics();
    panel.fillStyle(0x4a4a68, 1);
    panel.fillRoundedRect(30, 20, GAME_WIDTH - 60, 340, 4);
    panel.lineStyle(2, 0xffffff, 0.8);
    panel.strokeRoundedRect(30, 20, GAME_WIDTH - 60, 340, 4);
    // Shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillRoundedRect(32, 22, GAME_WIDTH - 60, 340, 4);
    shadow.setDepth(-1);

    // Title
    this.add
      .text(GAME_WIDTH / 2, 40, "おつかれさま！", {
        fontSize: "36px",
        fontFamily: '"DotGothic16", monospace',
        color: "#ffe66d",
      })
      .setOrigin(0.5);

    // Player name
    this.add
      .text(
        GAME_WIDTH / 2,
        85,
        `${this.gameState.player.name} の一年間の記録`,
        {
          fontSize: "18px",
          fontFamily: '"DotGothic16", monospace',
          color: "#f5e6d3",
        },
      )
      .setOrigin(0.5);

    // Score calculation
    const happinessSystem = new HappinessSystem();
    const axes = HappinessSystem.toAxes(this.gameState.happiness);
    const finalScore = happinessSystem.calculateFinalScore(
      this.gameState.happiness,
    );
    const balanceBonus = happinessSystem.calculateBalanceBonus(axes);

    // 3 axes display
    const axesY = 130;
    const axisLabels = [
      { label: "くらし", value: axes.kurashi, color: "#ff9eb1" },
      { label: "つながり", value: axes.tsunagari, color: "#7ec8e3" },
      { label: "じぶん", value: axes.jibun, color: "#c8b6e2" },
    ];

    for (let i = 0; i < axisLabels.length; i++) {
      const { label, value, color } = axisLabels[i];
      const x = GAME_WIDTH / 2 - 200 + i * 200;

      this.add
        .text(x, axesY, label, {
          fontSize: "18px",
          fontFamily: '"DotGothic16", monospace',
          color,
        })
        .setOrigin(0.5);

      this.add
        .text(x, axesY + 30, `${value}`, {
          fontSize: "28px",
          fontFamily: '"DotGothic16", monospace',
          color: "#f5e6d3",
        })
        .setOrigin(0.5);
    }

    // 5 pillars breakdown
    const pillarsY = 210;
    this.add
      .text(GAME_WIDTH / 2, pillarsY, "[ 5つの柱 ]", {
        fontSize: "14px",
        fontFamily: '"DotGothic16", monospace',
        color: "#f5e6d3",
      })
      .setOrigin(0.5);

    const pillarLabels = [
      { label: "自然", value: this.gameState.happiness.nature },
      { label: "つながり", value: this.gameState.happiness.social },
      { label: "ものづくり", value: this.gameState.happiness.creation },
      { label: "お金", value: this.gameState.happiness.money },
      { label: "文化", value: this.gameState.happiness.culture },
    ];

    const pillarStartX = GAME_WIDTH / 2 - 280;
    for (let i = 0; i < pillarLabels.length; i++) {
      const { label, value } = pillarLabels[i];
      const x = pillarStartX + i * 140;

      this.add
        .text(x, pillarsY + 25, `${label}: ${value}`, {
          fontSize: "14px",
          fontFamily: '"DotGothic16", monospace',
          color: "#f5e6d3",
        })
        .setOrigin(0.5);
    }

    // Balance bonus
    if (balanceBonus > 0) {
      this.add
        .text(
          GAME_WIDTH / 2,
          pillarsY + 60,
          `バランスボーナス: +${balanceBonus}`,
          {
            fontSize: "16px",
            fontFamily: '"DotGothic16", monospace',
            color: "#ffe66d",
          },
        )
        .setOrigin(0.5);
    }

    // Final score
    this.add
      .text(GAME_WIDTH / 2, 320, `しあわせスコア: ${finalScore}`, {
        fontSize: "32px",
        fontFamily: '"DotGothic16", monospace',
        color: "#ffe66d",
      })
      .setOrigin(0.5);

    // Earned titles display
    this.drawEarnedTitles();

    // YearbookMini (season highlights)
    const yearbook = new YearbookMini(this, GAME_WIDTH / 2, 410);
    yearbook.setHighlights(this.gameState.seasonHighlights);

    // Replay button (pixel style)
    const btnX = GAME_WIDTH / 2;
    const btnY = GAME_HEIGHT - 50;
    const btnW = 220;
    const btnH = 44;

    const btnGfx = this.add.graphics();
    this.drawPixelButton(btnGfx, btnX, btnY, btnW, btnH, 0x5a8a5a);

    const replayButton = this.add
      .text(btnX, btnY, "もういちど遊ぶ", {
        fontSize: "22px",
        fontFamily: '"DotGothic16", monospace',
        color: "#f5e6d3",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    replayButton.on("pointerover", () => {
      btnGfx.clear();
      this.drawPixelButton(btnGfx, btnX, btnY, btnW, btnH, 0x7ab87a);
    });
    replayButton.on("pointerout", () => {
      btnGfx.clear();
      this.drawPixelButton(btnGfx, btnX, btnY, btnW, btnH, 0x5a8a5a);
    });

    replayButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("TitleScene");
      });
    });
  }

  private drawPixelButton(
    gfx: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    w: number,
    h: number,
    fillColor: number,
  ): void {
    const x = cx - w / 2;
    const y = cy - h / 2;

    gfx.fillStyle(0x1a1a2a, 0.8);
    gfx.fillRect(x + 2, y + 2, w, h);

    gfx.fillStyle(fillColor, 1);
    gfx.fillRect(x, y, w, h);

    gfx.lineStyle(2, 0xffffff, 0.8);
    gfx.strokeRect(x, y, w, h);
  }

  private drawEarnedTitles(): void {
    const earnedIds = this.gameState.earnedTitles;
    if (earnedIds.length === 0) return;

    const startY = 360;
    this.add
      .text(GAME_WIDTH / 2, startY, "- 獲得した称号 -", {
        fontSize: "14px",
        fontFamily: '"DotGothic16", monospace',
        color: "#ffe66d",
      })
      .setOrigin(0.5);

    const earnedDefs = TITLE_DEFINITIONS.filter((d) =>
      earnedIds.includes(d.id),
    );
    const titleNames = earnedDefs.map((d) => d.name).join("  ");

    this.add
      .text(GAME_WIDTH / 2, startY + 22, titleNames, {
        fontSize: "13px",
        fontFamily: '"DotGothic16", monospace',
        color: "#f5e6d3",
        wordWrap: { width: 600 },
        align: "center",
      })
      .setOrigin(0.5, 0);
  }
}
