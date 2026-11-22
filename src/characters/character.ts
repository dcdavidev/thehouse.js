/**
Base Character blueprint.
*/

import chalk from 'chalk';

import { printPause } from '../helpers/print-pause.js';
import { randomInt } from '../helpers/random.js';

/**
 * Base character blueprint with health management.
 */
export class Character {
  maxHealth: number;
  health: number;

  constructor() {
    this.maxHealth = randomInt(5, 10);
    this.health = this.maxHealth;
  }

  /**
  Return whether the character is alive.
  */
  get isAlive(): boolean {
    return this.health > 0;
  }

  /**
  Subtract damage from health, ring terminal bell on damage, and print health.
  */
  async loseHealth(damage = 1): Promise<void> {
    this.health -= damage;
    if (damage > 0) {
      process.stdout.write('\u{7}');
    }
    await this.printHealth();
  }

  /**
  Restore health to maximum and print the health bar.
  */
  async restoreHealth(): Promise<void> {
    this.health = this.maxHealth;
    await this.printHealth();
  }

  /**
  Print a colored bar representing current health.
  */
  async printHealth(): Promise<void> {
    const clampedHealth = Math.max(0, this.health);
    const lostPoints = Math.max(0, this.maxHealth - clampedHealth);

    const healthText =
      chalk.bold('Health: ') +
      chalk.red('*'.repeat(clampedHealth)) +
      chalk.dim('-'.repeat(lostPoints));

    await printPause(healthText);
  }
}
