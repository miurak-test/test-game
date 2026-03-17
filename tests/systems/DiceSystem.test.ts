import { describe, it, expect } from "vitest";
import { DiceSystem } from "@/systems/DiceSystem";

describe("DiceSystem", () => {
  it("roll returns values in range 1-6 (100 trials)", () => {
    const dice = new DiceSystem();
    for (let i = 0; i < 100; i++) {
      const value = dice.roll();
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it("fixed returns the specified value", () => {
    for (let expected = 1; expected <= 6; expected++) {
      const dice = DiceSystem.fixed(expected);
      expect(dice.roll()).toBe(expected);
      expect(dice.roll()).toBe(expected); // stable across calls
    }
  });
});
