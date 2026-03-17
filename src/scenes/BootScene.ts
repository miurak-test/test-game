import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "@/constants";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  create(): void {
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "Loading...", {
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }
}
