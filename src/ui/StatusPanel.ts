import Phaser from "phaser";
import type { HappinessAxes, FluctuationState } from "@/types";
import { calculateBarWidth, BAR_FULL_WIDTH } from "@/ui/status-panel-logic";

export { calculateBarWidth } from "@/ui/status-panel-logic";

/** Axis display configuration */
const AXIS_CONFIG: {
  key: keyof HappinessAxes;
  label: string;
  color: number;
}[] = [
  { key: "kurashi", label: "くらし", color: 0x66bb6a },
  { key: "tsunagari", label: "つながり", color: 0x42a5f5 },
  { key: "jibun", label: "じぶん", color: 0xab47bc },
];

/**
 * StatusPanel: displays the 3 happiness axes as colored bars,
 * numeric values, and fatigue/insight indicators.
 * Placed at the top of the screen.
 */
export class StatusPanel extends Phaser.GameObjects.Container {
  private barGraphics: Phaser.GameObjects.Graphics;
  private axisTexts: Phaser.GameObjects.Text[] = [];
  private fluctuationGraphics: Phaser.GameObjects.Graphics;
  private fluctuationText: Phaser.GameObjects.Text;

  private currentAxes: HappinessAxes = { kurashi: 0, tsunagari: 0, jibun: 0 };
  private currentFluctuation: FluctuationState = { fatigue: 0, insight: 0 };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    // Background panel
    const bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRoundedRect(0, 0, 420, 70, 6);
    this.add(bg);

    // Bar graphics layer
    this.barGraphics = scene.add.graphics();
    this.add(this.barGraphics);

    // Axis labels and value texts
    for (let i = 0; i < AXIS_CONFIG.length; i++) {
      const cfg = AXIS_CONFIG[i];
      const rowY = 10 + i * 18;

      const label = scene.add.text(8, rowY, cfg.label, {
        fontSize: "12px",
        color: "#ffffff",
      });
      this.add(label);

      const valueText = scene.add.text(280, rowY, "0", {
        fontSize: "12px",
        color: "#ffffff",
      });
      this.add(valueText);
      this.axisTexts.push(valueText);
    }

    // Fluctuation indicators
    this.fluctuationGraphics = scene.add.graphics();
    this.add(this.fluctuationGraphics);

    this.fluctuationText = scene.add.text(330, 10, "", {
      fontSize: "11px",
      color: "#cccccc",
      lineSpacing: 4,
    });
    this.add(this.fluctuationText);

    this.drawBars();
    this.drawFluctuationIndicators();
  }

  /** Update the 3-axis bars */
  updateAxes(axes: HappinessAxes): void {
    this.currentAxes = { ...axes };
    this.drawBars();
  }

  /** Update fatigue/insight indicators */
  updateFluctuation(fluctuation: FluctuationState): void {
    this.currentFluctuation = { ...fluctuation };
    this.drawFluctuationIndicators();
  }

  /** Animate bar changes from one state to another */
  animateChange(
    from: HappinessAxes,
    toAxes: HappinessAxes,
    duration: number = 500,
  ): void {
    this.currentAxes = { ...from };
    this.drawBars();

    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration,
      onUpdate: (tween) => {
        const t = tween.getValue() ?? 0;
        this.currentAxes = {
          kurashi: Math.round(from.kurashi + (toAxes.kurashi - from.kurashi) * t),
          tsunagari: Math.round(
            from.tsunagari + (toAxes.tsunagari - from.tsunagari) * t,
          ),
          jibun: Math.round(from.jibun + (toAxes.jibun - from.jibun) * t),
        };
        this.drawBars();
      },
      onComplete: () => {
        this.currentAxes = { ...toAxes };
        this.drawBars();
      },
    });
  }

  private drawBars(): void {
    this.barGraphics.clear();

    for (let i = 0; i < AXIS_CONFIG.length; i++) {
      const cfg = AXIS_CONFIG[i];
      const rowY = 10 + i * 18;
      const barX = 80;
      const value = this.currentAxes[cfg.key];
      const width = calculateBarWidth(value);

      // Bar background (empty)
      this.barGraphics.fillStyle(0x333333, 0.8);
      this.barGraphics.fillRect(barX, rowY + 2, BAR_FULL_WIDTH, 10);

      // Bar fill
      if (width > 0) {
        this.barGraphics.fillStyle(cfg.color, 0.9);
        this.barGraphics.fillRect(barX, rowY + 2, width, 10);
      }

      // Bar border
      this.barGraphics.lineStyle(1, 0xffffff, 0.3);
      this.barGraphics.strokeRect(barX, rowY + 2, BAR_FULL_WIDTH, 10);

      // Update numeric text
      this.axisTexts[i].setText(`${value}`);
    }
  }

  private drawFluctuationIndicators(): void {
    this.fluctuationGraphics.clear();

    const baseX = 330;
    const fatigueY = 35;
    const insightY = 52;

    // Fatigue squares (red-ish)
    const fatigueBlocks = Math.min(10, this.currentFluctuation.fatigue);
    for (let i = 0; i < fatigueBlocks; i++) {
      this.fluctuationGraphics.fillStyle(0xff6666, 0.8);
      this.fluctuationGraphics.fillRect(baseX + i * 8, fatigueY, 6, 6);
    }

    // Insight squares (yellow-ish)
    const insightBlocks = Math.min(10, this.currentFluctuation.insight);
    for (let i = 0; i < insightBlocks; i++) {
      this.fluctuationGraphics.fillStyle(0xffdd44, 0.8);
      this.fluctuationGraphics.fillRect(baseX + i * 8, insightY, 6, 6);
    }

    this.fluctuationText.setText(
      `疲労 ${this.currentFluctuation.fatigue}\n閃き ${this.currentFluctuation.insight}`,
    );
  }
}
