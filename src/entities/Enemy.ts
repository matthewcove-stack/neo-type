import Phaser from 'phaser';

export default class Enemy extends Phaser.GameObjects.Rectangle {
  private health: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    health: number
  ) {
    super(scene, x, y, width, height, color, 1);
    this.health = health;

    scene.add.existing(this);
    scene.physics.add.existing(this, false);

    this.setOrigin(0.5, 0.5);
    this.setDepth(1);
    this.setActive(true);
    this.setVisible(true);
    this.setAlpha(1);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(false);
    body.moves = true;
    body.enable = true;
    body.setSize(width, height, true);
  }

  setSpeedX(speed: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(speed, 0);
  }

  applyDamage(amount: number): boolean {
    this.health -= amount;
    if (this.health <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }
}
