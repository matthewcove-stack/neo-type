import Phaser from 'phaser';

export type SpawnConfig = {
  intervalMs: number;
  paddingY: number;
  spawnOffsetX: number;
  onSpawn: (x: number, y: number) => void;
};

export default class EnemySpawner {
  private scene: Phaser.Scene;
  private config: SpawnConfig;
  private active: boolean;
  private elapsedMs: number;

  constructor(scene: Phaser.Scene, config: SpawnConfig) {
    this.scene = scene;
    this.config = config;
    this.active = false;
    this.elapsedMs = 0;
  }

  start() {
    this.active = true;
    this.elapsedMs = 0;
  }

  stop() {
    this.active = false;
    this.elapsedMs = 0;
  }

  update(deltaMs: number) {
    if (!this.active) {
      return;
    }

    this.elapsedMs += deltaMs;

    while (this.elapsedMs >= this.config.intervalMs) {
      this.elapsedMs -= this.config.intervalMs;

      const width = this.scene.scale.width;
      const height = this.scene.scale.height;
      const minY = this.config.paddingY;
      const maxY = Math.max(minY, height - this.config.paddingY);
      const spawnY = Phaser.Math.Between(minY, maxY);

      this.config.onSpawn(width + this.config.spawnOffsetX, spawnY);
    }
  }
}
