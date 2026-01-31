export type ChargeState = {
  chargeMs: number;
  level: number;
  canFireBeam: boolean;
};

export type ChargeConfig = {
  startMs: number;
  thresholdsMs: [number, number, number];
  beamCooldownMs: number;
};

export const clampCharge = (chargeMs: number, maxMs: number) => {
  if (chargeMs < 0) return 0;
  return Math.min(chargeMs, maxMs);
};

export const getChargeLevel = (chargeMs: number, thresholdsMs: [number, number, number]) => {
  if (chargeMs >= thresholdsMs[2]) return 3;
  if (chargeMs >= thresholdsMs[1]) return 2;
  if (chargeMs >= thresholdsMs[0]) return 1;
  return 0;
};

export default class ChargeController {
  private config: ChargeConfig;
  private chargeMs: number;
  private holdMs: number;
  private charging: boolean;
  private beamCooldownRemaining: number;

  constructor(config: ChargeConfig) {
    this.config = config;
    this.chargeMs = 0;
    this.holdMs = 0;
    this.charging = false;
    this.beamCooldownRemaining = 0;
  }

  reset() {
    this.chargeMs = 0;
    this.holdMs = 0;
    this.charging = false;
    this.beamCooldownRemaining = 0;
  }

  update(deltaMs: number, isCharging: boolean) {
    if (this.beamCooldownRemaining > 0) {
      this.beamCooldownRemaining = Math.max(0, this.beamCooldownRemaining - deltaMs);
    }

    if (isCharging) {
      this.holdMs += deltaMs;
      if (this.holdMs >= this.config.startMs) {
        this.charging = true;
        const maxMs = this.config.thresholdsMs[2];
        this.chargeMs = clampCharge(this.chargeMs + deltaMs, maxMs);
      }
    } else {
      this.holdMs = 0;
      this.charging = false;
    }
  }

  release(): ChargeState {
    const level = getChargeLevel(this.chargeMs, this.config.thresholdsMs);
    const canFireBeam = this.charging && level >= 1 && this.beamCooldownRemaining === 0;

    if (canFireBeam) {
      this.beamCooldownRemaining = this.config.beamCooldownMs;
    }

    const result = {
      chargeMs: this.chargeMs,
      level,
      canFireBeam
    };

    this.chargeMs = 0;
    this.holdMs = 0;
    this.charging = false;
    return result;
  }

  getChargeMs() {
    return this.chargeMs;
  }

  getChargeLevel() {
    return getChargeLevel(this.chargeMs, this.config.thresholdsMs);
  }

  isCharging() {
    return this.charging;
  }

  getHoldMs() {
    return this.holdMs;
  }

  getCooldownRemaining() {
    return this.beamCooldownRemaining;
  }
}
