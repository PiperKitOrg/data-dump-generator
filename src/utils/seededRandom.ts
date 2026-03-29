export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /**
   * Generates the next pseudorandom number in the sequence using the
   * Mulberry32 algorithm. Returns a floating point number in [0, 1).
   * 
   * @returns {number} Pseudorandom number between 0 (inclusive) and 1 (exclusive).
   */
  next(): number {
    // Update state with an arbitrary constant
    this.state += 0x6d2b79f5;
    let t = this.state;
    // Mix bits with multiplication and bitwise operations
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    // Final mixing and normalization to [0, 1)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(min: number, max: number): number {
    if (max < min) {
      return min;
    }
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  bool(probability = 0.5): boolean {
    return this.next() < probability;
  }

  pick<T>(items: T[]): T {
    return items[this.int(0, items.length - 1)];
  }

  shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = this.int(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
