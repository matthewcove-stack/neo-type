export type WaveConfig = {
  id: string;
  triggerX: number;
  yPositions: number[];
  spacingX: number;
};

export type StageConfig = {
  scrollSpeed: number;
  endX: number;
  checkpoints: number[];
  waves: WaveConfig[];
};

export default class StageController {
  private config: StageConfig;
  private triggered: Set<string>;
  private checkpointIndex: number;

  constructor(config: StageConfig) {
    this.config = config;
    this.triggered = new Set();
    this.checkpointIndex = 0;
  }

  getScrollSpeed() {
    return this.config.scrollSpeed;
  }

  getEndX() {
    return this.config.endX;
  }

  getCheckpointIndex() {
    return this.checkpointIndex;
  }

  getCheckpointX() {
    return this.config.checkpoints[this.checkpointIndex] ?? 0;
  }

  update(cameraX: number): WaveConfig[] {
    this.updateCheckpoint(cameraX);
    const wavesToSpawn: WaveConfig[] = [];

    for (const wave of this.config.waves) {
      if (!this.triggered.has(wave.id) && cameraX >= wave.triggerX) {
        this.triggered.add(wave.id);
        wavesToSpawn.push(wave);
      }
    }

    return wavesToSpawn;
  }

  resetToCheckpoint(index: number) {
    this.checkpointIndex = Math.max(0, Math.min(index, this.config.checkpoints.length - 1));
    const checkpointX = this.getCheckpointX();
    this.triggered = new Set(
      this.config.waves.filter((wave) => wave.triggerX <= checkpointX).map((wave) => wave.id)
    );
  }

  private updateCheckpoint(cameraX: number) {
    for (let i = this.config.checkpoints.length - 1; i >= 0; i -= 1) {
      if (cameraX >= this.config.checkpoints[i]) {
        this.checkpointIndex = i;
        return;
      }
    }
  }
}
