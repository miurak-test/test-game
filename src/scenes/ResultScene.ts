import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "@/constants";
import type { GameState } from "@/types";
import { HappinessSystem } from "@/systems/HappinessSystem";

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
    bg.fillStyle(0x1a1a3a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    this.add
      .text(GAME_WIDTH / 2, 40, "おつかれさま！", {
        fontSize: "36px",
        color: "#ffdd44",
        fontStyle: "bold",
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
          color: "#aaaaaa",
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
      { label: "くらし", value: axes.kurashi, color: "#66bb6a" },
      { label: "つながり", value: axes.tsunagari, color: "#42a5f5" },
      { label: "じぶん", value: axes.jibun, color: "#ffa726" },
    ];

    for (let i = 0; i < axisLabels.length; i++) {
      const { label, value, color } = axisLabels[i];
      const x = GAME_WIDTH / 2 - 200 + i * 200;

      this.add
        .text(x, axesY, label, {
          fontSize: "18px",
          color,
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      this.add
        .text(x, axesY + 30, `${value}`, {
          fontSize: "28px",
          color: "#ffffff",
        })
        .setOrigin(0.5);
    }

    // 5 pillars breakdown
    const pillarsY = 210;
    this.add
      .text(GAME_WIDTH / 2, pillarsY, "[ 5つの柱 ]", {
        fontSize: "14px",
        color: "#888888",
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
          color: "#cccccc",
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
            color: "#ffaa44",
          },
        )
        .setOrigin(0.5);
    }

    // Final score
    this.add
      .text(GAME_WIDTH / 2, 320, `しあわせスコア: ${finalScore}`, {
        fontSize: "32px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Season highlights (annual mini)
    this.drawSeasonHighlights();

    // Replay button
    const replayButton = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 50, "もういちど遊ぶ", {
        fontSize: "22px",
        color: "#ffffff",
        backgroundColor: "#4a90d9",
        padding: { x: 24, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    replayButton.on("pointerover", () => {
      replayButton.setStyle({ backgroundColor: "#5aa0e9" });
    });
    replayButton.on("pointerout", () => {
      replayButton.setStyle({ backgroundColor: "#4a90d9" });
    });

    replayButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("TitleScene");
      });
    });
  }

  private drawSeasonHighlights(): void {
    const startY = 370;
    const seasonLabels: Record<string, string> = {
      spring: "春",
      summer: "夏",
      autumn: "秋",
      winter: "冬",
    };

    this.add
      .text(GAME_WIDTH / 2, startY, "- 季節のハイライト -", {
        fontSize: "16px",
        color: "#aaaaaa",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const seasons = ["spring", "summer", "autumn", "winter"] as const;
    for (let i = 0; i < seasons.length; i++) {
      const season = seasons[i];
      const highlight = this.gameState.seasonHighlights.find(
        (h) => h.season === season,
      );

      const label = seasonLabels[season] ?? season;
      const eventName = highlight ? highlight.description : "---";
      const x = GAME_WIDTH / 2 - 250 + i * 170;
      const y = startY + 30;

      this.add
        .text(x, y, `${label}: ${eventName}`, {
          fontSize: "13px",
          color: "#cccccc",
          wordWrap: { width: 150 },
        })
        .setOrigin(0.5, 0);
    }
  }
}
