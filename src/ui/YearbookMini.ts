import Phaser from "phaser";
import type { SeasonHighlight } from "@/types";

/** Season label mapping */
const SEASON_LABELS: Record<string, string> = {
  spring: "春",
  summer: "夏",
  autumn: "秋",
  winter: "冬",
};

/**
 * YearbookMini: displays season-by-season highlight events.
 * Used in ResultScene.
 */
export class YearbookMini extends Phaser.GameObjects.Container {
  private highlightTexts: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    // Retro scroll style background
    const bgWidth = 680;
    const bgHeight = 80;
    const bgGfx = scene.add.graphics();
    bgGfx.fillStyle(0x4a4a68, 0.9);
    bgGfx.fillRoundedRect(-bgWidth / 2, -5, bgWidth, bgHeight, 4);
    bgGfx.lineStyle(1, 0xffffff, 0.6);
    bgGfx.strokeRoundedRect(-bgWidth / 2, -5, bgWidth, bgHeight, 4);
    this.add(bgGfx);

    // Title
    const title = scene.add
      .text(0, 0, "- 季節のハイライト -", {
        fontSize: "16px",
        fontFamily: '"DotGothic16", monospace',
        color: "#ffe66d",
      })
      .setOrigin(0.5, 0);
    this.add(title);
  }

  /** Set highlight events for each season */
  setHighlights(highlights: SeasonHighlight[]): void {
    // Clear previous highlight texts
    for (const text of this.highlightTexts) {
      text.destroy();
    }
    this.highlightTexts = [];

    const seasons = ["spring", "summer", "autumn", "winter"] as const;

    for (let i = 0; i < seasons.length; i++) {
      const season = seasons[i];
      const highlight = highlights.find((h) => h.season === season);
      const label = SEASON_LABELS[season] ?? season;
      const eventName = highlight ? highlight.description : "---";

      const x = -250 + i * 170;
      const y = 30;

      const text = this.scene.add
        .text(x, y, `${label}: ${eventName}`, {
          fontSize: "13px",
          fontFamily: '"DotGothic16", monospace',
          color: "#f5e6d3",
          wordWrap: { width: 150 },
        })
        .setOrigin(0.5, 0);

      this.add(text);
      this.highlightTexts.push(text);
    }
  }
}
