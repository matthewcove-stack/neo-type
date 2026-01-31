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
  private timer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, config: SpawnConfig) {
    this.scene = scene;
    this.config = config;
  }

  start() {
    this.stop();

    this.timer = this.scene.time.addEvent({
      delay: this.config.intervalMs,
      loop: true,
      callback: () => {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;
        const minY = this.config.paddingY;
        const maxY = Math.max(minY, height - this.config.paddingY);
        const spawnY = Phaser.Math.Between(minY, maxY);

        this.config.onSpawn(width + this.config.spawnOffsetX, spawnY);
      }
    });
  }

  stop() {
    if (this.timer) {
      this.timer.remove(false);
      this.timer = undefined;
    }
  }
}
