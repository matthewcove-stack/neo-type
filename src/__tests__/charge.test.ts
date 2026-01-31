import { describe, expect, it } from 'vitest';
import ChargeController, { getChargeLevel } from '../weapons/ChargeController';

describe('ChargeController', () => {
  it('maps charge to levels', () => {
    const thresholds: [number, number, number] = [400, 800, 1200];
    expect(getChargeLevel(0, thresholds)).toBe(0);
    expect(getChargeLevel(399, thresholds)).toBe(0);
    expect(getChargeLevel(400, thresholds)).toBe(1);
    expect(getChargeLevel(799, thresholds)).toBe(1);
    expect(getChargeLevel(800, thresholds)).toBe(2);
    expect(getChargeLevel(1199, thresholds)).toBe(2);
    expect(getChargeLevel(1200, thresholds)).toBe(3);
  });

  it('fires beam only when charge level >= 1', () => {
    const controller = new ChargeController({ startMs: 300, thresholdsMs: [400, 800, 1200], beamCooldownMs: 800 });
    controller.update(200, true);
    const low = controller.release();
    expect(low.level).toBe(0);
    expect(low.canFireBeam).toBe(false);

    controller.update(700, true);
    const charged = controller.release();
    expect(charged.level).toBeGreaterThanOrEqual(1);
    expect(charged.canFireBeam).toBe(true);
  });

  it('prevents beam firing during cooldown', () => {
    const controller = new ChargeController({ startMs: 100, thresholdsMs: [200, 400, 600], beamCooldownMs: 500 });
    controller.update(300, true);
    expect(controller.release().canFireBeam).toBe(true);

    controller.update(300, true);
    expect(controller.release().canFireBeam).toBe(false);

    controller.update(500, false);
    controller.update(300, true);
    expect(controller.release().canFireBeam).toBe(true);
  });

  it('never fires a beam if released before charge start threshold', () => {
    const controller = new ChargeController({ startMs: 300, thresholdsMs: [400, 800, 1200], beamCooldownMs: 800 });
    controller.update(250, true);
    const result = controller.release();
    expect(result.canFireBeam).toBe(false);
    expect(result.level).toBe(0);
  });
});
