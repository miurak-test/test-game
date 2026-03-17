import Phaser from "phaser";

const DICE_SIZE = 60;
const DOT_RADIUS = 5;
const ROLL_INTERVAL = 80;
const ROLL_FRAMES = 10;

/** Dot positions for each dice face (1-6), relative to dice center */
const DOT_POSITIONS: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 0, y: 0 }],
  2: [
    { x: -14, y: -14 },
    { x: 14, y: 14 },
  ],
  3: [
    { x: -14, y: -14 },
    { x: 0, y: 0 },
    { x: 14, y: 14 },
  ],
  4: [
    { x: -14, y: -14 },
    { x: 14, y: -14 },
    { x: -14, y: 14 },
    { x: 14, y: 14 },
  ],
  5: [
    { x: -14, y: -14 },
    { x: 14, y: -14 },
    { x: 0, y: 0 },
    { x: -14, y: 14 },
    { x: 14, y: 14 },
  ],
  6: [
    { x: -14, y: -14 },
    { x: 14, y: -14 },
    { x: -14, y: 0 },
    { x: 14, y: 0 },
    { x: -14, y: 14 },
    { x: 14, y: 14 },
  ],
};

/**
 * DiceDisplay: renders a dice face using Graphics dots.
 * Placed at the bottom-right of the screen.
 */
export class DiceDisplay extends Phaser.GameObjects.Container {
  private diceGraphics: Phaser.GameObjects.Graphics;
  private currentValue: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    this.diceGraphics = scene.add.graphics();
    this.add(this.diceGraphics);

    this.drawDice(1);
  }

  /** Animate a dice roll: random faces flashing, then settle on finalValue */
  animateRoll(finalValue: number): Promise<void> {
    return new Promise<void>((resolve) => {
      let frame = 0;

      const timer = this.scene.time.addEvent({
        delay: ROLL_INTERVAL,
        repeat: ROLL_FRAMES - 1,
        callback: () => {
          frame++;
          // Show random face during animation
          const randomFace = Phaser.Math.Between(1, 6);
          this.drawDice(randomFace);

          if (frame >= ROLL_FRAMES) {
            timer.destroy();
            this.drawDice(finalValue);
            this.currentValue = finalValue;
            resolve();
          }
        },
      });
    });
  }

  /** Immediately show a specific dice value */
  showValue(value: number): void {
    this.currentValue = value;
    this.drawDice(value);
  }

  private drawDice(value: number): void {
    this.diceGraphics.clear();
    const half = DICE_SIZE / 2;

    // Dice body (white rounded rect)
    this.diceGraphics.fillStyle(0xffffff, 1);
    this.diceGraphics.fillRoundedRect(-half, -half, DICE_SIZE, DICE_SIZE, 8);

    // Border
    this.diceGraphics.lineStyle(2, 0x333333, 1);
    this.diceGraphics.strokeRoundedRect(-half, -half, DICE_SIZE, DICE_SIZE, 8);

    // Dots
    const dots = DOT_POSITIONS[value];
    if (dots) {
      this.diceGraphics.fillStyle(0x333333, 1);
      for (const dot of dots) {
        this.diceGraphics.fillCircle(dot.x, dot.y, DOT_RADIUS);
      }
    }
  }
}
