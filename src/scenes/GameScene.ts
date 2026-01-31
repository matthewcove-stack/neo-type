import Phaser from 'phaser';
import Beam from '../entities/Beam';
import Bullet from '../entities/Bullet';
import Drone from '../entities/Drone';
import Enemy from '../entities/Enemy';
import Player, { type MovementState } from '../entities/Player';
import {
  BEAM_SETTINGS,
  BULLET_SETTINGS,
  CHARGE_SETTINGS,
  DEBUG_SETTINGS,
  DRONE_SETTINGS,
  DRONE_KNOCKBACK_SETTINGS,
  ENEMY_SETTINGS,
  GAME_HEIGHT,
  GAME_WIDTH,
  HAZARD_BLOCKS,
  HUD_SETTINGS,
  PLAYER_SETTINGS,
  SCORE_SETTINGS,
  STAGE_GATE_SETTINGS,
  STAGE_SETTINGS,
  TERRAIN_BLOCKS,
  WAVE_SCRIPT
} from '../constants';
import PlayerWeaponSystem from '../systems/PlayerWeaponSystem';
import DroneController from '../systems/DroneController';
import StageController from '../systems/StageController';
import { applyPlayerDeath } from '../logic/lives';
import ChargeController from '../weapons/ChargeController';

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
  private beams!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private terrain!: Phaser.Physics.Arcade.StaticGroup;
  private hazards!: Phaser.Physics.Arcade.StaticGroup;
  private weaponSystem!: PlayerWeaponSystem;
  private drone!: Drone;
  private droneController!: DroneController;
  private chargeController!: ChargeController;
  private stageController!: StageController;
  private stageGate!: Phaser.GameObjects.Rectangle;
  private movementKeys!: { wasd: MovementKeySet; arrows: MovementKeySet };
  private fireKey!: Phaser.Input.Keyboard.Key;
  private droneKey!: Phaser.Input.Keyboard.Key;
  private restartKey!: Phaser.Input.Keyboard.Key;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private droneText!: Phaser.GameObjects.Text;
  private chargeText!: Phaser.GameObjects.Text;
  private gameOverText!: Phaser.GameObjects.Text;
  private stageClearText!: Phaser.GameObjects.Text;
  private debugText!: Phaser.GameObjects.Text;

  private state = {
    score: 0,
    lives: PLAYER_SETTINGS.lives,
    gameOver: false,
    respawning: false,
    stageClear: false,
    spawnCount: 0,
    lastSpawn: { x: 0, y: 0 },
    tick: 0,
    inputEvents: 0,
    lastSpawnMs: 0,
    prevFireDown: false,
    charging: false,
    dronePrev: { x: 0, y: 0 },
    pendingCheckpointX: 0
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
      respawning: false,
      stageClear: false,
      spawnCount: 0,
      lastSpawn: { x: 0, y: 0 },
      tick: 0,
      inputEvents: 0,
      lastSpawnMs: 0,
      prevFireDown: false,
      charging: false,
      dronePrev: { x: 0, y: 0 },
      pendingCheckpointX: 0
    };
    this.physics.resume();

    this.add.rectangle(width / 2, height / 2, width, height, 0x0b0f14).setDepth(-1);

    this.physics.world.setBounds(0, 0, STAGE_SETTINGS.endX + width, height);
    this.cameras.main.setBounds(0, 0, STAGE_SETTINGS.endX + width, height);
    this.cameras.main.scrollX = 0;
    this.createTextures();

    this.bullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: false,
      maxSize: 128
    });

    this.beams = this.physics.add.group({
      classType: Beam,
      runChildUpdate: false,
      maxSize: 16
    });

    this.enemies = this.physics.add.group({
      classType: Enemy,
      runChildUpdate: false
    });

    this.terrain = this.physics.add.staticGroup();
    this.hazards = this.physics.add.staticGroup();

    this.player = new Player(
      this,
      PLAYER_SETTINGS.spawnX,
      height * 0.5,
      'player-ship',
      PLAYER_SETTINGS.speed
    );

    this.drone = new Drone(
      this,
      PLAYER_SETTINGS.spawnX + DRONE_SETTINGS.frontOffsetX,
      height * 0.5 + DRONE_SETTINGS.offsetY,
      DRONE_SETTINGS.width,
      DRONE_SETTINGS.height,
      DRONE_SETTINGS.color
    );
    this.droneController = new DroneController(
      {
        frontX: DRONE_SETTINGS.frontOffsetX,
        rearX: DRONE_SETTINGS.rearOffsetX,
        detachedX: DRONE_SETTINGS.detachedOffsetX,
        offsetY: DRONE_SETTINGS.offsetY
      },
      DRONE_SETTINGS.followLerp
    );

    this.weaponSystem = new PlayerWeaponSystem(BULLET_SETTINGS.cooldownMs);
    this.chargeController = new ChargeController(CHARGE_SETTINGS);
    this.stageController = new StageController({
      scrollSpeed: STAGE_SETTINGS.scrollSpeed,
      endX: STAGE_SETTINGS.endX,
      checkpoints: [...STAGE_SETTINGS.checkpoints],
      waves: [...WAVE_SCRIPT]
    });

    this.setupInput();
    this.setupHud();

    this.createTerrain();
    this.createHazards();
    this.createStageGate();

    if (DEBUG_SETTINGS.forceSpawnOnStart) {
      this.spawnEnemy(width - 80, height * 0.5);
    }
    this.input.on('pointerdown', () => {
      this.input.keyboard?.resetKeys();
    });

    this.physics.add.overlap(this.bullets, this.enemies, this.handleBulletEnemyOverlap, undefined, this);
    this.physics.add.overlap(this.beams, this.enemies, this.handleBeamEnemyOverlap, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyOverlap, undefined, this);
    this.physics.add.overlap(this.drone, this.enemies, this.handleDroneEnemyOverlap, undefined, this);
    this.physics.add.collider(this.player, this.terrain, this.handlePlayerTerrainCollision, undefined, this);
    this.physics.add.overlap(this.player, this.hazards, this.handlePlayerHazardOverlap, undefined, this);
  }

  update(time: number, delta: number) {
    if (this.state.gameOver || this.state.stageClear) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
        this.scene.restart();
      }
      return;
    }

    if (!this.state.respawning) {
      this.player.update(this.readMovementState());
      this.clampPlayerToCamera();

      if (Phaser.Input.Keyboard.JustDown(this.droneKey)) {
        this.droneController.cycleState();
        this.updateHud();
      }

      this.chargeController.update(delta, this.fireKey.isDown);
      this.state.charging = this.chargeController.isCharging();

      if (this.fireKey.isDown && !this.state.charging) {
        this.weaponSystem.tryFire(time, true, () => this.fireNormalShots());
      }

      if (this.state.prevFireDown && !this.fireKey.isDown) {
        const chargeState = this.chargeController.release();
        if (chargeState.canFireBeam) {
          this.spawnBeamFrom(this.player.x + BEAM_SETTINGS.width * 0.5, this.player.y);
        }
      }

      this.state.prevFireDown = this.fireKey.isDown;

      this.state.dronePrev = { x: this.drone.x, y: this.drone.y };
      const target = this.droneController.getTargetPosition(
        this.player.x,
        this.player.y,
        this.drone.x,
        this.drone.y
      );
      this.drone.setPositionAndSync(target.x, target.y);
      this.keepDroneOutOfTerrain();
      this.updateHud();
    }

    this.scrollStage(delta);
    const waves = this.stageController.update(this.cameras.main.scrollX);
    waves.forEach((wave) => this.spawnWave(wave));
    if (this.cameras.main.scrollX >= this.stageController.getEndX()) {
      this.triggerStageClear();
      return;
    }

    this.cleanupBullets();
    this.cleanupBeams();
    this.cleanupEnemies();
    this.ensureEnemyMovement();
    this.state.tick += 1;
    this.updateDebug();
  }

  private setupInput() {
    const keyboard = this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
    const canvas = this.game.canvas;
    if (canvas) {
      canvas.setAttribute('tabindex', '1');
      canvas.focus();
    }

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
    this.droneKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.restartKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    keyboard.on('keydown', () => {
      this.state.inputEvents += 1;
    });
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
    this.droneText = this.add.text(
      HUD_SETTINGS.marginX,
      HUD_SETTINGS.marginY + 40 + HUD_SETTINGS.lineSpacing * 2,
      '',
      HUD_FONT
    );
    this.chargeText = this.add.text(
      HUD_SETTINGS.marginX,
      HUD_SETTINGS.marginY + 60 + HUD_SETTINGS.lineSpacing * 3,
      '',
      HUD_FONT
    );
    this.debugText = this.add.text(
      HUD_SETTINGS.marginX,
      HUD_SETTINGS.marginY + 80 + HUD_SETTINGS.lineSpacing * 4,
      '',
      HUD_FONT
    );

    this.scoreText.setScrollFactor(0);
    this.livesText.setScrollFactor(0);
    this.droneText.setScrollFactor(0);
    this.chargeText.setScrollFactor(0);
    this.debugText.setScrollFactor(0);

    const width = this.scale.width;
    const height = this.scale.height;
    this.gameOverText = this.add.text(width / 2, height / 2, 'GAME OVER\nPress Enter to Restart', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#f25f5c',
      align: 'center'
    });
    this.gameOverText.setOrigin(0.5, 0.5).setVisible(false);
    this.gameOverText.setScrollFactor(0);

    this.stageClearText = this.add.text(width / 2, height / 2, 'STAGE CLEAR\nScore: 0\nPress Enter to Restart', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#6effa0',
      align: 'center'
    });
    this.stageClearText.setOrigin(0.5, 0.5).setVisible(false);
    this.stageClearText.setScrollFactor(0);

    this.updateHud();
  }

  private updateHud() {
    this.scoreText.setText(`Score: ${this.state.score}`);
    this.livesText.setText(`Lives: ${this.state.lives}`);
    const chargeLevel = this.chargeController.getChargeLevel();
    const chargingLabel = this.chargeController.isCharging() ? 'CHARGING' : 'READY';
    this.droneText.setText(`Drone: ${this.droneController.getState()}`);
    this.chargeText.setText(`Charge: ${chargingLabel} ${chargeLevel}/3`);
    this.updateDebug();
  }

  private updateDebug() {
    const enemiesAlive = this.enemies.countActive(true);
    const { x, y } = this.state.lastSpawn;
    const cameraX = Math.round(this.cameras.main.scrollX);
    const inputState = `U${this.movementKeys.wasd.up.isDown || this.movementKeys.arrows.up.isDown ? 1 : 0}` +
      ` D${this.movementKeys.wasd.down.isDown || this.movementKeys.arrows.down.isDown ? 1 : 0}` +
      ` L${this.movementKeys.wasd.left.isDown || this.movementKeys.arrows.left.isDown ? 1 : 0}` +
      ` R${this.movementKeys.wasd.right.isDown || this.movementKeys.arrows.right.isDown ? 1 : 0}` +
      ` F${this.fireKey.isDown ? 1 : 0}`;
    this.debugText.setText(
      `CamX: ${cameraX} | Enemies: ${enemiesAlive} | Spawns: ${this.state.spawnCount} | Last spawn: ${Math.round(x)}, ${Math.round(y)}\n` +
      `Input: ${inputState} | Charging: ${this.state.charging ? 1 : 0} | KeyEvents: ${this.state.inputEvents} | GameOver: ${this.state.gameOver ? 1 : 0} Respawn: ${this.state.respawning ? 1 : 0} Tick: ${this.state.tick}`
    );
  }

  private spawnBulletFrom(spawnX: number, spawnY: number) {
    const bullet = this.bullets.get(spawnX, spawnY, 'player-bullet') as Bullet | null;
    if (!bullet) {
      return;
    }
    bullet.fire(spawnX, spawnY, BULLET_SETTINGS.speed);
  }

  private fireNormalShots() {
    const playerX = this.player.x + BULLET_SETTINGS.spawnOffsetX;
    const playerY = this.player.y;
    this.spawnBulletFrom(playerX, playerY);

    const droneX = this.drone.x + DRONE_SETTINGS.bulletOffsetX;
    const droneY = this.drone.y;
    this.spawnBulletFrom(droneX, droneY);
  }

  private spawnBeamFrom(spawnX: number, spawnY: number) {
    const beam = this.beams.get(spawnX, spawnY, 'player-beam') as Beam | null;
    if (!beam) {
      return;
    }
    beam.fire(spawnX, spawnY, BEAM_SETTINGS.speed);

    this.time.delayedCall(BEAM_SETTINGS.durationMs, () => {
      if (beam.active) {
        beam.deactivate();
      }
    });
  }

  private spawnEnemy(x: number, y: number) {
    const enemy = new Enemy(
      this,
      x,
      y,
      ENEMY_SETTINGS.width,
      ENEMY_SETTINGS.height,
      ENEMY_SETTINGS.color,
      ENEMY_SETTINGS.maxHealth
    );
    enemy.setSpeedX(-ENEMY_SETTINGS.speed);
    enemy.setActive(true);
    enemy.setVisible(true);
    enemy.setDepth(1);
    enemy.setStrokeStyle(1, 0xffffff);

    this.enemies.add(enemy);
    this.state.spawnCount += 1;
    this.state.lastSpawn = { x, y };
    this.updateHud();
  }

  private getRandomEnemyY() {
    const height = this.scale.height;
    const minY = ENEMY_SETTINGS.spawnPaddingY;
    const maxY = Math.max(minY, height - ENEMY_SETTINGS.spawnPaddingY);
    return Phaser.Math.Between(minY, maxY);
  }

  private ensureEnemyMovement() {
    this.enemies.children.each((child) => {
      const enemy = child as Enemy;
      if (!enemy.active) {
        return;
      }
      const body = enemy.body as Phaser.Physics.Arcade.Body;
      if (body && body.velocity.x === 0) {
        body.setVelocity(-ENEMY_SETTINGS.speed, 0);
      }
    });
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

    bullet.deactivate();
    const destroyed = enemy.applyDamage(1);

    if (destroyed) {
      this.state.score += SCORE_SETTINGS.enemyKill;
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

  private handleBeamEnemyOverlap(
    beamObject: Phaser.GameObjects.GameObject,
    enemyObject: Phaser.GameObjects.GameObject
  ) {
    const beam = beamObject as Beam;
    const enemy = enemyObject as Enemy;

    if (!beam.active || !enemy.active) {
      return;
    }

    const destroyed = enemy.applyDamage(1);
    if (destroyed) {
      this.state.score += SCORE_SETTINGS.enemyKill;
      this.updateHud();
    }
  }

  private handleDroneEnemyOverlap(
    _droneObject: Phaser.GameObjects.GameObject,
    enemyObject: Phaser.GameObjects.GameObject
  ) {
    const enemy = enemyObject as Enemy;
    if (!enemy.active) {
      return;
    }

    if (enemy.getData('knockbackActive')) {
      return;
    }

    enemy.setData('knockbackActive', true);
    enemy.setSpeedX(DRONE_KNOCKBACK_SETTINGS.speedX);

    this.time.delayedCall(DRONE_KNOCKBACK_SETTINGS.durationMs, () => {
      if (enemy.active) {
        enemy.setSpeedX(-ENEMY_SETTINGS.speed);
        enemy.setData('knockbackActive', false);
      }
    });
  }

  private onPlayerDeath() {
    const result = applyPlayerDeath(this.state.lives);
    this.state.lives = result.lives;
    this.updateHud();

    this.player.setVelocity(0, 0);
    this.player.setActive(false);
    this.player.setVisible(false);
    (this.player.body as Phaser.Physics.Arcade.Body).enable = false;
    this.drone.setActive(false);
    this.drone.setVisible(false);
    (this.drone.body as Phaser.Physics.Arcade.Body).enable = false;

    if (result.gameOver) {
      this.triggerGameOver();
      return;
    }

    this.state.respawning = true;
    this.state.pendingCheckpointX = this.stageController.getCheckpointX();

    this.time.delayedCall(PLAYER_SETTINGS.respawnDelayMs, () => {
      this.respawnPlayer();
    });
  }

  private respawnPlayer() {
    const checkpointX = this.state.pendingCheckpointX;
    this.cameras.main.scrollX = checkpointX;
    this.player.setPosition(checkpointX + PLAYER_SETTINGS.spawnX, this.scale.height * 0.5);
    this.player.setActive(true);
    this.player.setVisible(true);
    (this.player.body as Phaser.Physics.Arcade.Body).enable = true;

    this.drone.setActive(true);
    this.drone.setVisible(true);
    (this.drone.body as Phaser.Physics.Arcade.Body).enable = true;
    this.drone.setPositionAndSync(
      this.player.x + DRONE_SETTINGS.frontOffsetX,
      this.player.y + DRONE_SETTINGS.offsetY
    );

    this.weaponSystem.reset();
    this.chargeController.reset();
    this.clearActiveEntities();
    this.stageController.resetToCheckpoint(this.stageController.getCheckpointIndex());
    this.state.respawning = false;
  }

  private triggerGameOver() {
    this.state.gameOver = true;
    this.physics.pause();
    this.gameOverText.setVisible(true);
  }

  private cleanupBullets() {
    const width = this.scale.width;
    const leftEdge = this.cameras.main.scrollX;
    this.bullets.children.each((child) => {
      const bullet = child as Bullet;
      if (bullet.active && bullet.x > leftEdge + width + BULLET_SETTINGS.cullPadding) {
        bullet.deactivate();
      }
    });
  }

  private cleanupEnemies() {
    const width = this.scale.width;
    const leftEdge = this.cameras.main.scrollX;
    this.enemies.children.each((child) => {
      const enemy = child as Enemy;
      if (enemy.active && enemy.x < leftEdge - ENEMY_SETTINGS.cullPadding) {
        enemy.destroy();
      }
    });
  }

  private scrollStage(delta: number) {
    const camera = this.cameras.main;
    const nextX = camera.scrollX + this.stageController.getScrollSpeed() * (delta / 1000);
    camera.scrollX = Math.min(nextX, this.stageController.getEndX());
  }

  private clampPlayerToCamera() {
    const camera = this.cameras.main;
    const minX = camera.scrollX + PLAYER_SETTINGS.cameraClampPaddingX;
    const maxX = camera.scrollX + this.scale.width - PLAYER_SETTINGS.cameraClampPaddingX;
    const minY = PLAYER_SETTINGS.cameraClampPaddingY;
    const maxY = this.scale.height - PLAYER_SETTINGS.cameraClampPaddingY;
    this.player.setPosition(
      Phaser.Math.Clamp(this.player.x, minX, maxX),
      Phaser.Math.Clamp(this.player.y, minY, maxY)
    );
  }

  private spawnWave(wave: { triggerX: number; yPositions: number[]; spacingX: number }) {
    const baseX = wave.triggerX + this.scale.width + ENEMY_SETTINGS.spawnOffsetX;
    wave.yPositions.forEach((y, index) => {
      const spawnX = baseX + index * wave.spacingX;
      this.spawnEnemy(spawnX, y);
    });
  }

  private createTerrain() {
    TERRAIN_BLOCKS.forEach((block) => {
      const terrain = this.add.rectangle(block.x, block.y, block.width, block.height, 0x1b2a36);
      terrain.setOrigin(0.5, 0.5);
      terrain.setDepth(0);
      this.physics.add.existing(terrain, true);
      this.terrain.add(terrain);
    });
  }

  private createHazards() {
    HAZARD_BLOCKS.forEach((hazard) => {
      const hazardRect = this.add.rectangle(hazard.x, hazard.y, hazard.width, hazard.height, hazard.color);
      hazardRect.setOrigin(0.5, 0.5);
      hazardRect.setStrokeStyle(1, 0xffffff);
      hazardRect.setDepth(1);
      this.physics.add.existing(hazardRect, true);
      this.hazards.add(hazardRect);
    });
  }

  private createStageGate() {
    const gateX = STAGE_SETTINGS.endX + this.scale.width - STAGE_GATE_SETTINGS.width;
    const gateY = this.scale.height * 0.5;
    this.stageGate = this.add.rectangle(
      gateX,
      gateY,
      STAGE_GATE_SETTINGS.width,
      STAGE_GATE_SETTINGS.height,
      STAGE_GATE_SETTINGS.color
    );
    this.stageGate.setStrokeStyle(2, 0xffffff);
    this.stageGate.setDepth(1);
  }

  private keepDroneOutOfTerrain() {
    const prev = this.state.dronePrev;
    this.physics.overlap(this.drone, this.terrain, () => {
      this.drone.setPositionAndSync(prev.x, prev.y);
    });
  }

  private handlePlayerTerrainCollision() {
    if (this.state.gameOver || this.state.respawning || this.state.stageClear) {
      return;
    }
    this.onPlayerDeath();
  }

  private handlePlayerHazardOverlap() {
    if (this.state.gameOver || this.state.respawning || this.state.stageClear) {
      return;
    }
    this.onPlayerDeath();
  }

  private clearActiveEntities() {
    this.enemies.clear(true, true);
    this.bullets.clear(true, true);
    this.beams.clear(true, true);
  }

  private triggerStageClear() {
    this.state.stageClear = true;
    this.clearActiveEntities();
    this.stageClearText.setText(`STAGE CLEAR\nScore: ${this.state.score}\nPress Enter to Restart`);
    this.stageClearText.setVisible(true);
  }

  private cleanupBeams() {
    const width = this.scale.width;
    const leftEdge = this.cameras.main.scrollX;
    this.beams.children.each((child) => {
      const beam = child as Beam;
      if (beam.active && beam.x > leftEdge + width + BEAM_SETTINGS.width) {
        beam.deactivate();
      }
    });
  }

  private createTextures() {
    if (this.textures.exists('player-ship')) {
      this.textures.remove('player-ship');
    }
    if (this.textures.exists('player-bullet')) {
      this.textures.remove('player-bullet');
    }
    if (this.textures.exists('player-beam')) {
      this.textures.remove('player-beam');
    }

    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x4dd1ff, 1);
    playerGraphics.fillRect(0, 0, PLAYER_SETTINGS.width, PLAYER_SETTINGS.height);
    playerGraphics.generateTexture('player-ship', PLAYER_SETTINGS.width, PLAYER_SETTINGS.height);
    playerGraphics.destroy();

    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xf9d56e, 1);
    bulletGraphics.fillRect(0, 0, BULLET_SETTINGS.width, BULLET_SETTINGS.height);
    bulletGraphics.generateTexture('player-bullet', BULLET_SETTINGS.width, BULLET_SETTINGS.height);
    bulletGraphics.destroy();

    const beamGraphics = this.add.graphics();
    beamGraphics.fillStyle(BEAM_SETTINGS.color, 1);
    beamGraphics.fillRect(0, 0, BEAM_SETTINGS.width, BEAM_SETTINGS.height);
    beamGraphics.generateTexture('player-beam', BEAM_SETTINGS.width, BEAM_SETTINGS.height);
    beamGraphics.destroy();
  }
}
