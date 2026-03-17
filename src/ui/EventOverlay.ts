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

    // RPG conversation window style background
    this.bg = scene.add.graphics();
    // Dark shadow
    this.bg.fillStyle(0x1a1a2a, 0.6);
    this.bg.fillRoundedRect(panelX + 2, panelY + 2, PANEL_WIDTH, PANEL_HEIGHT, 4);
    // Main panel
    this.bg.fillStyle(0x4a4a68, 0.95);
    this.bg.fillRoundedRect(panelX, panelY, PANEL_WIDTH, PANEL_HEIGHT, 4);
    // White border
    this.bg.lineStyle(2, 0xffffff, 0.8);
    this.bg.strokeRoundedRect(panelX, panelY, PANEL_WIDTH, PANEL_HEIGHT, 4);
    this.add(this.bg);

    // Event title
    this.titleText = scene.add
      .text(GAME_WIDTH / 2, panelY + 40, "", {
        fontSize: "22px",
        fontFamily: '"DotGothic16", monospace',
        color: "#ffe66d",
      })
      .setOrigin(0.5);
    this.add(this.titleText);

    // Event description
    this.descText = scene.add
      .text(GAME_WIDTH / 2, panelY + 90, "", {
        fontSize: "16px",
        fontFamily: '"DotGothic16", monospace',
        color: "#f5e6d3",
        wordWrap: { width: PANEL_WIDTH - 60 },
        align: "center",
      })
      .setOrigin(0.5, 0);
    this.add(this.descText);

    // NPC dialogue
    this.npcText = scene.add
      .text(GAME_WIDTH / 2, panelY + 200, "", {
        fontSize: "14px",
        fontFamily: '"DotGothic16", monospace',
        color: "#7ec8e3",
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
