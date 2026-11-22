/**
Random helper utilities matching Python's random.randint and random.choice.
*/

/**
Return a random integer N such that min &lt;= N &lt;= max.
*/
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
Return a random element from a non-empty array.
*/
export function randomChoice<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error('Cannot choose from an empty array.');
  }
  return items[Math.floor(Math.random() * items.length)]!;
}
