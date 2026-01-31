import Phaser from 'phaser';

export default class Drone extends Phaser.GameObjects.Rectangle {
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, color: number) {
    super(scene, x, y, width, height, color, 1);

    scene.add.existing(this);
    scene.physics.add.existing(this, false);

    this.setOrigin(0.5, 0.5);
    this.setDepth(2);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.moves = false;
    body.enable = true;
    body.setSize(width, height, true);
  }

  setPositionAndSync(x: number, y: number) {
    this.setPosition(x, y);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.reset(x, y);
  }
}
