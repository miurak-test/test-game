export class DiceSystem {
  private rng: () => number;

  constructor(rng?: () => number) {
    this.rng = rng ?? Math.random;
  }

  roll(): number {
    return Math.floor(this.rng() * 6) + 1;
  }

  static fixed(value: number): DiceSystem {
    return new DiceSystem(() => (value - 1) / 6);
  }
}
