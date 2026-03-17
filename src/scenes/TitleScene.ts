import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "@/constants";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: "TitleScene" });
  }

  create(): void {
    this.cameras.main.fadeIn(300);

    // Background gradient effect using Graphics
    const bg = this.add.graphics();
    bg.fillStyle(0x1a3a5c, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title text
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 3, "ほのぼの人生すごろく", {
        fontSize: "40px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 3 + 50, "～四季めぐり～", {
        fontSize: "22px",
        color: "#aaddff",
      })
      .setOrigin(0.5);

    // Start button
    const startButton = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.65, "はじめる", {
        fontSize: "28px",
        color: "#ffffff",
        backgroundColor: "#4a90d9",
        padding: { x: 32, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Button hover effects
    startButton.on("pointerover", () => {
      startButton.setStyle({ backgroundColor: "#5aa0e9" });
    });
    startButton.on("pointerout", () => {
      startButton.setStyle({ backgroundColor: "#4a90d9" });
    });

    // Transition to CharacterSelectScene
    startButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("CharacterSelectScene");
      });
    });
  }
}
