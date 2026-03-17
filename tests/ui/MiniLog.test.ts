import { describe, it, expect, beforeEach } from "vitest";
import { LogEntryManager, formatLogEntry } from "@/ui/mini-log-logic";
import type { HappinessChangeLog } from "@/types";

function createLog(
  overrides: Partial<HappinessChangeLog> = {},
): HappinessChangeLog {
  return {
    turn: 1,
    season: "spring",
    source: "花見",
    rawChanges: { nature: 2 },
    fatigueEffect: 0,
    insightEffect: 0,
    finalChanges: { nature: 2 },
    ...overrides,
  };
}

describe("formatLogEntry", () => {
  it("formats positive pillar changes with + sign", () => {
    const log = createLog({
      source: "花見",
      finalChanges: { nature: 2 },
    });
    expect(formatLogEntry(log)).toBe("花見: 自然+2");
  });

  it("formats negative pillar changes", () => {
    const log = createLog({
      source: "嵐",
      finalChanges: { nature: -1 },
    });
    expect(formatLogEntry(log)).toBe("嵐: 自然-1");
  });

  it("formats multiple pillar changes", () => {
    const log = createLog({
      source: "祭り",
      finalChanges: { social: 3, culture: 1 },
    });
    expect(formatLogEntry(log)).toBe("祭り: つながり+3 文化+1");
  });

  it("includes fatigue effect when non-zero", () => {
    const log = createLog({
      source: "疲労イベント",
      finalChanges: { nature: 1 },
      fatigueEffect: -2,
    });
    expect(formatLogEntry(log)).toBe("疲労イベント: 自然+1 疲労-2");
  });

  it("includes insight effect when positive", () => {
    const log = createLog({
      source: "内省",
      finalChanges: { creation: 1 },
      insightEffect: 1,
    });
    expect(formatLogEntry(log)).toBe("内省: ものづくり+1 閃き+1");
  });

  it("shows '変化なし' when no changes", () => {
    const log = createLog({
      source: "散歩",
      finalChanges: {},
      fatigueEffect: 0,
      insightEffect: 0,
    });
    expect(formatLogEntry(log)).toBe("散歩: 変化なし");
  });

  it("skips zero-value pillar changes", () => {
    const log = createLog({
      source: "イベント",
      finalChanges: { nature: 0, social: 2 },
    });
    expect(formatLogEntry(log)).toBe("イベント: つながり+2");
  });
});

describe("LogEntryManager", () => {
  let manager: LogEntryManager;

  beforeEach(() => {
    manager = new LogEntryManager(5);
  });

  it("starts with empty entries", () => {
    expect(manager.getEntries()).toEqual([]);
  });

  it("adds an entry to the list", () => {
    manager.addEntry(createLog({ source: "花見" }));
    expect(manager.getEntries()).toHaveLength(1);
    expect(manager.getEntries()[0]).toContain("花見");
  });

  it("preserves insertion order (newest last)", () => {
    manager.addEntry(createLog({ source: "1番目" }));
    manager.addEntry(createLog({ source: "2番目" }));
    manager.addEntry(createLog({ source: "3番目" }));

    const entries = manager.getEntries();
    expect(entries).toHaveLength(3);
    expect(entries[0]).toContain("1番目");
    expect(entries[2]).toContain("3番目");
  });

  it("removes oldest entry when exceeding maxEntries(5)", () => {
    for (let i = 1; i <= 6; i++) {
      manager.addEntry(createLog({ source: `イベント${i}` }));
    }

    const entries = manager.getEntries();
    expect(entries).toHaveLength(5);
    // Oldest (イベント1) should be removed
    expect(entries[0]).toContain("イベント2");
    expect(entries[4]).toContain("イベント6");
  });

  it("maintains maxEntries limit with many additions", () => {
    for (let i = 1; i <= 20; i++) {
      manager.addEntry(createLog({ source: `ev${i}` }));
    }

    const entries = manager.getEntries();
    expect(entries).toHaveLength(5);
    expect(entries[0]).toContain("ev16");
    expect(entries[4]).toContain("ev20");
  });

  it("clears all entries", () => {
    manager.addEntry(createLog({ source: "a" }));
    manager.addEntry(createLog({ source: "b" }));
    manager.clear();

    expect(manager.getEntries()).toEqual([]);
  });

  it("can add entries after clear", () => {
    manager.addEntry(createLog({ source: "before" }));
    manager.clear();
    manager.addEntry(createLog({ source: "after" }));

    const entries = manager.getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toContain("after");
  });

  it("respects custom maxEntries", () => {
    const small = new LogEntryManager(2);
    small.addEntry(createLog({ source: "a" }));
    small.addEntry(createLog({ source: "b" }));
    small.addEntry(createLog({ source: "c" }));

    const entries = small.getEntries();
    expect(entries).toHaveLength(2);
    expect(entries[0]).toContain("b");
    expect(entries[1]).toContain("c");
  });
});
