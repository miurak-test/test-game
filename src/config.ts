import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "@/constants";
import { BootScene } from "@/scenes/BootScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#2d2d2d",
  parent: "game-container",
  scene: [BootScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
