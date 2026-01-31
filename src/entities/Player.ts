import Phaser from 'phaser';

export type MovementState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private speed: number;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, speed: number) {
    super(scene, x, y, texture);
    this.speed = speed;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
  }

  update(movement: MovementState) {
    const velocity = new Phaser.Math.Vector2(0, 0);

    if (movement.left) {
      velocity.x -= 1;
    }
    if (movement.right) {
      velocity.x += 1;
    }
    if (movement.up) {
      velocity.y -= 1;
    }
    if (movement.down) {
      velocity.y += 1;
    }

    if (velocity.lengthSq() > 0) {
      velocity.normalize();
      this.setVelocity(velocity.x * this.speed, velocity.y * this.speed);
    } else {
      this.setVelocity(0, 0);
    }
  }
}
