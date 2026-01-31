import { describe, expect, it } from 'vitest';
import { canFire } from '../logic/cooldown';

describe('canFire', () => {
  it('returns true when cooldown is zero', () => {
    expect(canFire(1000, 1000, 0)).toBe(true);
  });

  it('returns false when cooldown has not elapsed', () => {
    expect(canFire(1000, 950, 100)).toBe(false);
  });

  it('returns true when cooldown has elapsed', () => {
    expect(canFire(1050, 950, 100)).toBe(true);
  });
});
