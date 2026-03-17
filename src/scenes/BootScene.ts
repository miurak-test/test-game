import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "@/constants";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  create(): void {
    // Background
    this.cameras.main.setBackgroundColor(0x2b2b3a);

    // Logo title
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, "恋も人生もダイス次第", {
        fontSize: "36px",
        fontFamily: '"DotGothic16", monospace',
        color: "#ffe66d",
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 + 10,
        "～人生、全部賭ける。～",
        {
          fontSize: "18px",
          fontFamily: '"DotGothic16", monospace',
          color: "#f5e6d3",
        },
      )
      .setOrigin(0.5);

    // Loading indicator
    const loadingText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, "Loading...", {
        fontSize: "18px",
        fontFamily: '"DotGothic16", monospace',
        color: "#888888",
      })
      .setOrigin(0.5);

    // Fade in effect
    this.cameras.main.fadeIn(500);

    // Transition to TitleScene after 1 second
    this.time.delayedCall(1000, () => {
      loadingText.destroy();
      this.cameras.main.fadeOut(300);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("TitleScene");
      });
    });
  }
}
