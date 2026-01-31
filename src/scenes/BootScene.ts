import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload() {
    // Placeholder: load assets later
  }

  create() {
    this.scene.start('game');
  }
}
