import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "@/constants";
import type { ResolvedEvent } from "@/types";

const FADE_DURATION = 300;
const PANEL_WIDTH = 600;
const PANEL_HEIGHT = 300;

/**
 * EventOverlay: displays an event card with title, description,
 * and optional NPC dialogue. Centered on screen with fade-in/out.
 */
export class EventOverlay extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private titleText: Phaser.GameObjects.Text;
  private descText: Phaser.GameObjects.Text;
  private npcText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(100);
    this.setVisible(false);
    this.setAlpha(0);

    const panelX = GAME_WIDTH / 2 - PANEL_WIDTH / 2;
    const panelY = GAME_HEIGHT / 2 - PANEL_HEIGHT / 2;

    // Semi-transparent background panel
    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x000000, 0.75);
    this.bg.fillRoundedRect(panelX, panelY, PANEL_WIDTH, PANEL_HEIGHT, 8);
    this.bg.lineStyle(2, 0xffffff, 0.4);
    this.bg.strokeRoundedRect(panelX, panelY, PANEL_WIDTH, PANEL_HEIGHT, 8);
    this.add(this.bg);

    // Event title
    this.titleText = scene.add
      .text(GAME_WIDTH / 2, panelY + 40, "", {
        fontSize: "22px",
        color: "#ffdd44",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add(this.titleText);

    // Event description
    this.descText = scene.add
      .text(GAME_WIDTH / 2, panelY + 90, "", {
        fontSize: "16px",
        color: "#ffffff",
        wordWrap: { width: PANEL_WIDTH - 60 },
        align: "center",
      })
      .setOrigin(0.5, 0);
    this.add(this.descText);

    // NPC dialogue
    this.npcText = scene.add
      .text(GAME_WIDTH / 2, panelY + 200, "", {
        fontSize: "14px",
        color: "#aaddff",
        fontStyle: "italic",
      })
      .setOrigin(0.5);
    this.add(this.npcText);
  }

  /** Show an event card with fade-in animation */
  show(event: ResolvedEvent): Promise<void> {
    this.titleText.setText(event.title);
    this.descText.setText(event.description);

    if (event.npc) {
      this.npcText.setText(`${event.npc.name} がいる`);
      this.npcText.setVisible(true);
    } else {
      this.npcText.setVisible(false);
    }

    this.setVisible(true);

    return new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: this,
        alpha: 1,
        duration: FADE_DURATION,
        onComplete: () => {
          // Tap/click to dismiss
          this.scene.input.once("pointerdown", () => {
            this.hide();
          });
          resolve();
        },
      });
    });
  }

  /** Hide the event card with fade-out animation */
  hide(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: FADE_DURATION,
        onComplete: () => {
          this.setVisible(false);
          resolve();
        },
      });
    });
  }
}
