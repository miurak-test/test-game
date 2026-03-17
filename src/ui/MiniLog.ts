import Phaser from "phaser";
import type { HappinessChangeLog } from "@/types";
import { LogEntryManager, DEFAULT_MAX_ENTRIES } from "@/ui/mini-log-logic";

export { formatLogEntry, LogEntryManager } from "@/ui/mini-log-logic";

/**
 * MiniLog: displays the last 5 happiness change logs.
 * Placed at the bottom-left of the screen.
 */
export class MiniLog extends Phaser.GameObjects.Container {
  private logText: Phaser.GameObjects.Text;
  private entryManager: LogEntryManager;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    this.entryManager = new LogEntryManager(DEFAULT_MAX_ENTRIES);

    // Background panel (RPG message window style)
    const bg = scene.add.graphics();
    bg.fillStyle(0x4a4a68, 0.9);
    bg.fillRoundedRect(0, 0, 260, 100, 4);
    bg.lineStyle(1, 0xffffff, 0.6);
    bg.strokeRoundedRect(0, 0, 260, 100, 4);
    this.add(bg);

    // Log text
    this.logText = scene.add.text(6, 4, "", {
      fontSize: "13px",
      fontFamily: '"DotGothic16", monospace',
      color: "#f5e6d3",
      lineSpacing: 2,
      wordWrap: { width: 248 },
    });
    this.add(this.logText);
  }

  /** Add a new log entry */
  addEntry(log: HappinessChangeLog): void {
    this.entryManager.addEntry(log);
    this.updateDisplay();
  }

  /** Clear all log entries */
  clear(): void {
    this.entryManager.clear();
    this.updateDisplay();
  }

  private updateDisplay(): void {
    this.logText.setText(this.entryManager.getEntries().join("\n"));
  }
}
