import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "@/constants";
import type { EventChoice } from "@/types";

const BUTTON_WIDTH = 400;
const BUTTON_HEIGHT = 40;
const BUTTON_SPACING = 12;
const BUTTON_COLOR = 0x5a5a8a;
const BUTTON_HOVER_COLOR = 0x6a6a9a;

/**
 * ChoiceOverlay: displays 2-3 choice buttons vertically.
 * Resolves with the selected choice's id.
 */
export class ChoiceOverlay extends Phaser.GameObjects.Container {
  private buttons: Phaser.GameObjects.Container[] = [];

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(110);
    this.setVisible(false);
  }

  /** Show choices and return the selected choice id */
  showChoices(choices: EventChoice[]): Promise<string> {
    this.clearButtons();
    this.setVisible(true);

    return new Promise<string>((resolve) => {
      const totalHeight =
        choices.length * BUTTON_HEIGHT +
        (choices.length - 1) * BUTTON_SPACING;
      const startY = GAME_HEIGHT / 2 + 40;

      for (let i = 0; i < choices.length; i++) {
        const choice = choices[i];
        const y = startY + i * (BUTTON_HEIGHT + BUTTON_SPACING);

        const btnContainer = this.createButton(
          choice.text,
          GAME_WIDTH / 2,
          y,
          () => {
            this.hide();
            resolve(choice.id);
          },
        );

        this.buttons.push(btnContainer);
        this.add(btnContainer);
      }
    });
  }

  /** Hide the overlay and clean up buttons */
  hide(): void {
    this.clearButtons();
    this.setVisible(false);
  }

  private createButton(
    text: string,
    x: number,
    y: number,
    onClick: () => void,
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    // Button background
    const bg = this.scene.add.graphics();
    bg.fillStyle(BUTTON_COLOR, 1);
    bg.fillRoundedRect(
      -BUTTON_WIDTH / 2,
      -BUTTON_HEIGHT / 2,
      BUTTON_WIDTH,
      BUTTON_HEIGHT,
      6,
    );
    container.add(bg);

    // Button text
    const label = this.scene.add
      .text(0, 0, text, {
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    container.add(label);

    // Interactive zone
    const hitZone = this.scene.add
      .zone(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT)
      .setInteractive({ useHandCursor: true });
    container.add(hitZone);

    hitZone.on("pointerover", () => {
      bg.clear();
      bg.fillStyle(BUTTON_HOVER_COLOR, 1);
      bg.fillRoundedRect(
        -BUTTON_WIDTH / 2,
        -BUTTON_HEIGHT / 2,
        BUTTON_WIDTH,
        BUTTON_HEIGHT,
        6,
      );
    });

    hitZone.on("pointerout", () => {
      bg.clear();
      bg.fillStyle(BUTTON_COLOR, 1);
      bg.fillRoundedRect(
        -BUTTON_WIDTH / 2,
        -BUTTON_HEIGHT / 2,
        BUTTON_WIDTH,
        BUTTON_HEIGHT,
        6,
      );
    });

    hitZone.on("pointerdown", onClick);

    return container;
  }

  private clearButtons(): void {
    for (const btn of this.buttons) {
      btn.destroy();
    }
    this.buttons = [];
    this.removeAll();
  }
}
