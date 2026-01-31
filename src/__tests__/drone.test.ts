import { describe, expect, it } from 'vitest';
import DroneController, { DroneState } from '../systems/DroneController';

describe('DroneController', () => {
  it('cycles through front -> rear -> detached -> front', () => {
    const controller = new DroneController(
      { frontX: 40, rearX: -40, detachedX: 120, offsetY: 0 },
      0.1
    );

    expect(controller.getState()).toBe(DroneState.AttachedFront);
    controller.cycleState();
    expect(controller.getState()).toBe(DroneState.AttachedRear);
    controller.cycleState();
    expect(controller.getState()).toBe(DroneState.Detached);
    controller.cycleState();
    expect(controller.getState()).toBe(DroneState.AttachedFront);
  });
});
