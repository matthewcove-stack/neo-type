export enum DroneState {
  AttachedFront = 'FRONT',
  AttachedRear = 'REAR',
  Detached = 'DETACHED'
}

export type DroneOffsets = {
  frontX: number;
  rearX: number;
  detachedX: number;
  offsetY: number;
};

export default class DroneController {
  private state: DroneState;
  private offsets: DroneOffsets;
  private followLerp: number;

  constructor(offsets: DroneOffsets, followLerp: number) {
    this.offsets = offsets;
    this.followLerp = followLerp;
    this.state = DroneState.AttachedFront;
  }

  getState() {
    return this.state;
  }

  cycleState() {
    if (this.state === DroneState.AttachedFront) {
      this.state = DroneState.AttachedRear;
    } else if (this.state === DroneState.AttachedRear) {
      this.state = DroneState.Detached;
    } else {
      this.state = DroneState.AttachedFront;
    }
  }

  private lerp(start: number, end: number, t: number) {
    return start + (end - start) * t;
  }

  getTargetPosition(playerX: number, playerY: number, currentX: number, currentY: number) {
    if (this.state === DroneState.AttachedFront) {
      return {
        x: playerX + this.offsets.frontX,
        y: playerY + this.offsets.offsetY
      };
    }

    if (this.state === DroneState.AttachedRear) {
      return {
        x: playerX + this.offsets.rearX,
        y: playerY + this.offsets.offsetY
      };
    }

    const targetX = playerX + this.offsets.detachedX;
    const targetY = playerY + this.offsets.offsetY;
    return {
      x: this.lerp(currentX, targetX, this.followLerp),
      y: this.lerp(currentY, targetY, this.followLerp)
    };
  }
}
