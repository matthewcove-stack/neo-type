import Phaser from 'phaser';
import Bullet from '../entities/Bullet';
import Enemy from '../entities/Enemy';
import Player, { type MovementState } from '../entities/Player';
import {
  BULLET_SETTINGS,
  ENEMY_SETTINGS,
  HUD_SETTINGS,
  PLAYER_SETTINGS
} from '../constants';
import PlayerWeaponSystem from '../systems/PlayerWeaponSystem';
import EnemySpawner from '../systems/EnemySpawner';
import { applyPlayerDeath } from '../logic/lives';

const HUD_FONT = {
  fontFamily: 'monospace',
  fontSize: '16px',
  color: '#d7e0ea'
};

type MovementKeySet = {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
};

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private weaponSystem!: PlayerWeaponSystem;
  private enemySpawner!: EnemySpawner;
  private movementKeys!: { wasd: MovementKeySet; arrows: MovementKeySet };
  private fireKey!: Phaser.Input.Keyboard.Key;
  private restartKey!: Phaser.Input.Keyboard.Key;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private gameOverText!: Phaser.GameObjects.Text;

  private state = {
    score: 0,
    lives: PLAYER_SETTINGS.lives,
    gameOver: false,
    respawning: false
  };

  constructor() {
    super('game');
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.state = {
      score: 0,
      lives: PLAYER_SETTINGS.lives,
      gameOver: false,
      respawning: false
    };
    this.physics.resume();

    this.add.rectangle(width / 2, height / 2, width, height, 0x0b0f14).setDepth(-1);

    this.physics.world.setBounds(0, 0, width, height);
    this.createTextures();

    this.bullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: false
    });

    this.enemies = this.physics.add.group({
      classType: Enemy,
      runChildUpdate: false
    });

    this.player = new Player(
      this,
      PLAYER_SETTINGS.spawnX,
      height * 0.5,
      'player-ship',
      PLAYER_SETTINGS.speed
    );

    this.weaponSystem = new PlayerWeaponSystem(BULLET_SETTINGS.cooldownMs);
    this.enemySpawner = new EnemySpawner(this, {
      intervalMs: ENEMY_SETTINGS.spawnIntervalMs,
      paddingY: ENEMY_SETTINGS.spawnPaddingY,
      spawnOffsetX: ENEMY_SETTINGS.spawnOffsetX,
      onSpawn: (x, y) => this.spawnEnemy(x, y)
    });
    this.enemySpawner.start();

    this.setupInput();
    this.setupHud();

    this.physics.add.overlap(this.bullets, this.enemies, this.handleBulletEnemyOverlap, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyOverlap, undefined, this);
  }

  update(time: number) {
    if (this.state.gameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart();
      }
      return;
    }

    if (!this.state.respawning) {
      this.player.update(this.readMovementState());
      this.weaponSystem.tryFire(time, this.fireKey.isDown, () => this.spawnBullet());
    }

    this.cleanupBullets();
    this.cleanupEnemies();
  }

  private setupInput() {
    const keyboard = this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;

    const cursors = keyboard.createCursorKeys();
    const wasd = keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    }) as MovementKeySet;

    const arrows: MovementKeySet = {
      up: cursors.up ?? wasd.up,
      down: cursors.down ?? wasd.down,
      left: cursors.left ?? wasd.left,
      right: cursors.right ?? wasd.right
    };

    this.movementKeys = { wasd, arrows };

    this.fireKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.restartKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  private readMovementState(): MovementState {
    const { wasd, arrows } = this.movementKeys;
    return {
      up: wasd.up.isDown || arrows.up.isDown,
      down: wasd.down.isDown || arrows.down.isDown,
      left: wasd.left.isDown || arrows.left.isDown,
      right: wasd.right.isDown || arrows.right.isDown
    };
  }

  private setupHud() {
    this.scoreText = this.add.text(HUD_SETTINGS.marginX, HUD_SETTINGS.marginY, '', HUD_FONT);
    this.livesText = this.add.text(
      HUD_SETTINGS.marginX,
      HUD_SETTINGS.marginY + 20 + HUD_SETTINGS.lineSpacing,
      '',
      HUD_FONT
    );

    const width = this.scale.width;
    const height = this.scale.height;
    this.gameOverText = this.add.text(width / 2, height / 2, 'GAME OVER\nPress Enter to Restart', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#f25f5c',
      align: 'center'
    });
    this.gameOverText.setOrigin(0.5, 0.5).setVisible(false);

    this.updateHud();
  }

  private updateHud() {
    this.scoreText.setText(`Score: ${this.state.score}`);
    this.livesText.setText(`Lives: ${this.state.lives}`);
  }

  private spawnBullet() {
    const bullet = new Bullet(
      this,
      this.player.x + BULLET_SETTINGS.spawnOffsetX,
      this.player.y,
      'player-bullet'
    );
    bullet.setVelocityX(BULLET_SETTINGS.speed);

    this.bullets.add(bullet);
  }

  private spawnEnemy(x: number, y: number) {
    const enemy = new Enemy(this, x, y, 'enemy-basic', ENEMY_SETTINGS.maxHealth);
    enemy.setVelocityX(-ENEMY_SETTINGS.speed);

    this.enemies.add(enemy);
  }

  private handleBulletEnemyOverlap(
    bulletObject: Phaser.GameObjects.GameObject,
    enemyObject: Phaser.GameObjects.GameObject
  ) {
    const bullet = bulletObject as Bullet;
    const enemy = enemyObject as Enemy;

    if (!bullet.active || !enemy.active) {
      return;
    }

    bullet.destroy();
    const destroyed = enemy.applyDamage(1);

    if (destroyed) {
      this.state.score += 1;
      this.updateHud();
    }
  }

  private handlePlayerEnemyOverlap(
    _playerObject: Phaser.GameObjects.GameObject,
    enemyObject: Phaser.GameObjects.GameObject
  ) {
    if (this.state.gameOver || this.state.respawning) {
      return;
    }

    const enemy = enemyObject as Enemy;
    enemy.destroy();

    this.onPlayerDeath();
  }

  private onPlayerDeath() {
    const result = applyPlayerDeath(this.state.lives);
    this.state.lives = result.lives;
    this.updateHud();

    this.player.setVelocity(0, 0);
    this.player.setActive(false);
    this.player.setVisible(false);
    (this.player.body as Phaser.Physics.Arcade.Body).enable = false;

    if (result.gameOver) {
      this.triggerGameOver();
      return;
    }

    this.state.respawning = true;

    this.time.delayedCall(PLAYER_SETTINGS.respawnDelayMs, () => {
      this.respawnPlayer();
    });
  }

  private respawnPlayer() {
    this.player.setPosition(PLAYER_SETTINGS.spawnX, this.scale.height * 0.5);
    this.player.setActive(true);
    this.player.setVisible(true);
    (this.player.body as Phaser.Physics.Arcade.Body).enable = true;

    this.weaponSystem.reset();
    this.state.respawning = false;
  }

  private triggerGameOver() {
    this.state.gameOver = true;
    this.enemySpawner.stop();
    this.physics.pause();
    this.gameOverText.setVisible(true);
  }

  private cleanupBullets() {
    if (!this.bullets) {
      return;
    }

    const width = this.scale.width;
    this.bullets.children.each((child) => {
      const bullet = child as Bullet;
      if (bullet.active && bullet.x > width + BULLET_SETTINGS.cullPadding) {
        bullet.destroy();
      }
    });
  }

  private cleanupEnemies() {
    if (!this.enemies) {
      return;
    }

    const width = this.scale.width;
    this.enemies.children.each((child) => {
      const enemy = child as Enemy;
      if (enemy.active && enemy.x < -ENEMY_SETTINGS.cullPadding) {
        enemy.destroy();
      }
    });
  }

  private createTextures() {
    if (!this.textures.exists('player-ship')) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0x4dd1ff, 1);
      graphics.fillRect(0, 0, PLAYER_SETTINGS.width, PLAYER_SETTINGS.height);
      graphics.generateTexture('player-ship', PLAYER_SETTINGS.width, PLAYER_SETTINGS.height);
      graphics.destroy();
    }

    if (!this.textures.exists('enemy-basic')) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xff6b6b, 1);
      graphics.fillRect(0, 0, ENEMY_SETTINGS.width, ENEMY_SETTINGS.height);
      graphics.generateTexture('enemy-basic', ENEMY_SETTINGS.width, ENEMY_SETTINGS.height);
      graphics.destroy();
    }

    if (!this.textures.exists('player-bullet')) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xf9d56e, 1);
      graphics.fillRect(0, 0, BULLET_SETTINGS.width, BULLET_SETTINGS.height);
      graphics.generateTexture('player-bullet', BULLET_SETTINGS.width, BULLET_SETTINGS.height);
      graphics.destroy();
    }
  }
}
