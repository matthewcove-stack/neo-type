import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Image {
  private health: number;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, health: number) {
    super(scene, x, y, texture);
    this.health = health;

    scene.add.existing(this);
    scene.physics.add.existing(this);
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
