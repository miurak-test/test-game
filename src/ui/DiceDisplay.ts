import Phaser from "phaser";

const DICE_SIZE = 90;
const DOT_RADIUS = 7;
const ROLL_INTERVAL = 80;
const ROLL_FRAMES = 10;

/** Dot positions for each dice face (1-6), relative to dice center */
const DOT_POSITIONS: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 0, y: 0 }],
  2: [
    { x: -21, y: -21 },
    { x: 21, y: 21 },
  ],
  3: [
    { x: -21, y: -21 },
    { x: 0, y: 0 },
    { x: 21, y: 21 },
  ],
  4: [
    { x: -21, y: -21 },
    { x: 21, y: -21 },
    { x: -21, y: 21 },
    { x: 21, y: 21 },
  ],
  5: [
    { x: -21, y: -21 },
    { x: 21, y: -21 },
    { x: 0, y: 0 },
    { x: -21, y: 21 },
    { x: 21, y: 21 },
  ],
  6: [
    { x: -21, y: -21 },
    { x: 21, y: -21 },
    { x: -21, y: 0 },
    { x: 21, y: 0 },
    { x: -21, y: 21 },
    { x: 21, y: 21 },
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

    // Dice body (dark panel color)
    this.diceGraphics.fillStyle(0x4a4a68, 1);
    this.diceGraphics.fillRoundedRect(-half, -half, DICE_SIZE, DICE_SIZE, 6);

    // Border (white pixel style)
    this.diceGraphics.lineStyle(2, 0xffffff, 0.8);
    this.diceGraphics.strokeRoundedRect(-half, -half, DICE_SIZE, DICE_SIZE, 6);

    // Dots (cream color)
    const dots = DOT_POSITIONS[value];
    if (dots) {
      this.diceGraphics.fillStyle(0xf5e6d3, 1);
      for (const dot of dots) {
        this.diceGraphics.fillCircle(dot.x, dot.y, DOT_RADIUS);
      }
    }
  }
}
