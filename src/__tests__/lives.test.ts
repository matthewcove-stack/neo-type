import { describe, expect, it } from 'vitest';
import { applyPlayerDeath } from '../logic/lives';

describe('applyPlayerDeath', () => {
  it('decrements lives when above zero', () => {
    expect(applyPlayerDeath(3)).toEqual({ lives: 2, gameOver: false });
  });

  it('returns game over when lives reach zero', () => {
    expect(applyPlayerDeath(1)).toEqual({ lives: 0, gameOver: true });
  });

  it('clamps lives at zero', () => {
    expect(applyPlayerDeath(0)).toEqual({ lives: 0, gameOver: true });
  });
});
