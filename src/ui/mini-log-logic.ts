/**
 * Pure logic functions for MiniLog.
 * Separated from Phaser-dependent code for testability.
 */

import type { HappinessChangeLog } from "@/types";

/** Default maximum number of visible log entries */
export const DEFAULT_MAX_ENTRIES = 5;

/** Pillar key to Japanese label mapping */
const PILLAR_LABELS: Record<string, string> = {
  nature: "自然",
  social: "つながり",
  creation: "ものづくり",
  money: "お金",
  culture: "文化",
};

/**
 * Format a HappinessChangeLog into a human-readable line.
 */
export function formatLogEntry(log: HappinessChangeLog): string {
  const parts: string[] = [];

  // Show final pillar changes
  for (const [key, value] of Object.entries(log.finalChanges)) {
    if (value !== undefined && value !== 0) {
      const label = PILLAR_LABELS[key] ?? key;
      const sign = value > 0 ? "+" : "";
      parts.push(`${label}${sign}${value}`);
    }
  }

  // Show fatigue/insight effects
  if (log.fatigueEffect !== 0) {
    parts.push(`疲労${log.fatigueEffect > 0 ? "+" : ""}${log.fatigueEffect}`);
  }
  if (log.insightEffect > 0) {
    parts.push(`閃き+${log.insightEffect}`);
  }

  const changes = parts.length > 0 ? parts.join(" ") : "変化なし";
  return `${log.source}: ${changes}`;
}

/**
 * Manages a bounded list of log entries.
 * Pure data class with no Phaser dependency.
 */
export class LogEntryManager {
  private entries: string[] = [];
  readonly maxEntries: number;

  constructor(maxEntries: number = DEFAULT_MAX_ENTRIES) {
    this.maxEntries = maxEntries;
  }

  /** Add an entry, removing the oldest if over capacity */
  addEntry(log: HappinessChangeLog): void {
    const formatted = formatLogEntry(log);
    this.entries.push(formatted);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
  }

  /** Remove all entries */
  clear(): void {
    this.entries = [];
  }

  /** Get current entries (newest last) */
  getEntries(): readonly string[] {
    return this.entries;
  }
}
