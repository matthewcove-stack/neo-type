import { canFire } from '../logic/cooldown';

export default class PlayerWeaponSystem {
  private cooldownMs: number;
  private lastFireMs: number;

  constructor(cooldownMs: number) {
    this.cooldownMs = cooldownMs;
    this.lastFireMs = -cooldownMs;
  }

  reset() {
    this.lastFireMs = -this.cooldownMs;
  }

  tryFire(nowMs: number, isFiring: boolean, fireAction: () => void) {
    if (!isFiring) {
      return;
    }

    if (canFire(nowMs, this.lastFireMs, this.cooldownMs)) {
      this.lastFireMs = nowMs;
      fireAction();
    }
  }
}
