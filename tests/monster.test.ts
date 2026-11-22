import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Monster } from '../src/characters/monster.js';
import { Player } from '../src/characters/player.js';

vi.mock('../src/helpers/print-pause.js', () => ({
  printPause: vi.fn().mockResolvedValue(undefined),
}));

describe('Monster', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with player reference and health between 5 and 10', () => {
    const player = new Player();
    const monster = new Monster(player);
    expect(monster.player).toBe(player);
    expect(monster.health).toBeGreaterThanOrEqual(5);
    expect(monster.health).toBeLessThanOrEqual(10);
  });

  it('formats string representation properly', () => {
    const player = new Player();
    const monster = new Monster(player);
    monster.health = 7;
    expect(monster.toString()).toBe('Monster - health: 7');
  });

  it('deals 1 or 2 damage to the player', async () => {
    const player = new Player();
    const loseHealthSpy = vi
      .spyOn(player, 'loseHealth')
      .mockResolvedValue(undefined);
    const monster = new Monster(player);

    await monster.dealDamage();

    expect(loseHealthSpy).toHaveBeenCalledTimes(1);
    const damage = loseHealthSpy.mock.calls[0]?.[0];
    expect([1, 2]).toContain(damage);
  });
});
