import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "@/constants";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: "TitleScene" });
  }

  create(): void {
    this.cameras.main.fadeIn(300);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x2b2b3a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Starfield particle decoration
    this.createStarfield();

    // Title text
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 3, "恋も人生もダイス次第", {
        fontSize: "36px",
        fontFamily: '"DotGothic16", monospace',
        color: "#ffe66d",
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 3 + 50,
        "～人生、全部賭ける。～",
        {
          fontSize: "18px",
          fontFamily: '"DotGothic16", monospace',
          color: "#f5e6d3",
        },
      )
      .setOrigin(0.5);

    // Start button with pixel-style border
    const btnX = GAME_WIDTH / 2;
    const btnY = GAME_HEIGHT * 0.65;
    const btnW = 200;
    const btnH = 48;

    const btnGfx = this.add.graphics();
    this.drawPixelButton(btnGfx, btnX, btnY, btnW, btnH, 0x5a8a5a);

    const startButton = this.add
      .text(btnX, btnY, "はじめる", {
        fontSize: "28px",
        fontFamily: '"DotGothic16", monospace',
        color: "#f5e6d3",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Button hover effects
    startButton.on("pointerover", () => {
      btnGfx.clear();
      this.drawPixelButton(btnGfx, btnX, btnY, btnW, btnH, 0x7ab87a);
    });
    startButton.on("pointerout", () => {
      btnGfx.clear();
      this.drawPixelButton(btnGfx, btnX, btnY, btnW, btnH, 0x5a8a5a);
    });

    // Transition to CharacterSelectScene
    startButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("CharacterSelectScene");
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

    // Drop shadow (dark)
    gfx.fillStyle(0x1a1a2a, 0.8);
    gfx.fillRect(x + 2, y + 2, w, h);

    // Main fill
    gfx.fillStyle(fillColor, 1);
    gfx.fillRect(x, y, w, h);

    // White border (2px)
    gfx.lineStyle(2, 0xffffff, 0.8);
    gfx.strokeRect(x, y, w, h);
  }

  private createStarfield(): void {
    const starCount = 40;
    for (let i = 0; i < starCount; i++) {
      const sx = Phaser.Math.Between(10, GAME_WIDTH - 10);
      const sy = Phaser.Math.Between(10, GAME_HEIGHT - 10);
      const size = Phaser.Math.Between(1, 3);

      const star = this.add.graphics();
      star.fillStyle(0xffffff, 0.6);
      star.fillRect(sx, sy, size, size);

      // Slow blinking tween
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: Phaser.Math.Between(1500, 3000),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }
}
