export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const PLAYER_SETTINGS = {
  speed: 260,
  spawnX: 120,
  lives: 3,
  respawnDelayMs: 1000,
  width: 28,
  height: 18,
  cameraClampPaddingX: 24,
  cameraClampPaddingY: 16
} as const;

export const BULLET_SETTINGS = {
  speed: 520,
  cooldownMs: 160,
  width: 12,
  height: 4,
  spawnOffsetX: 20,
  cullPadding: 40
} as const;

export const DRONE_SETTINGS = {
  width: 18,
  height: 14,
  color: 0x6effa0,
  frontOffsetX: 40,
  rearOffsetX: -40,
  detachedOffsetX: 120,
  offsetY: 0,
  followLerp: 0.12,
  bulletOffsetX: 12
} as const;

export const CHARGE_SETTINGS = {
  startMs: 300,
  thresholdsMs: [500, 900, 1300] as [number, number, number],
  beamCooldownMs: 800
} as const;

export const BEAM_SETTINGS = {
  speed: 700,
  width: 64,
  height: 20,
  durationMs: 200,
  color: 0x8be9ff
} as const;

export const ENEMY_SETTINGS = {
  speed: 140,
  spawnIntervalMs: 1200,
  width: 32,
  height: 24,
  spawnPaddingY: 28,
  spawnOffsetX: 40,
  maxHealth: 1,
  cullPadding: 60,
  color: 0xff2d2d
} as const;

export const DRONE_KNOCKBACK_SETTINGS = {
  speedX: -60,
  durationMs: 250
} as const;

export const SCORE_SETTINGS = {
  enemyKill: 100
} as const;

export const HUD_SETTINGS = {
  marginX: 16,
  marginY: 12,
  lineSpacing: 4
} as const;

export const DEBUG_SETTINGS = {
  forceSpawnOnStart: false
} as const;

export const STAGE_SETTINGS = {
  scrollSpeed: 80,
  endX: 3200,
  checkpoints: [0, 1200, 2400]
} as const;

export const STAGE_GATE_SETTINGS = {
  width: 36,
  height: 120,
  color: 0x4dd1ff
} as const;

export const TERRAIN_BLOCKS = [
  { x: 200, y: 520, width: 500, height: 20 },
  { x: 700, y: 520, width: 300, height: 20 },
  { x: 1100, y: 520, width: 400, height: 20 },
  { x: 1650, y: 520, width: 350, height: 20 },
  { x: 2300, y: 520, width: 500, height: 20 },
  { x: 2800, y: 520, width: 400, height: 20 },
  { x: 450, y: 20, width: 300, height: 20 },
  { x: 1200, y: 20, width: 350, height: 20 },
  { x: 1900, y: 20, width: 350, height: 20 },
  { x: 2600, y: 20, width: 300, height: 20 },
  { x: 900, y: 360, width: 160, height: 20 },
  { x: 1500, y: 220, width: 180, height: 20 },
  { x: 2100, y: 320, width: 180, height: 20 }
] as const;

export const HAZARD_BLOCKS = [
  { x: 1350, y: 300, width: 140, height: 10, color: 0xffee58 },
  { x: 2500, y: 260, width: 160, height: 10, color: 0xffee58 }
] as const;

export const WAVE_SCRIPT = [
  { id: 'wave-1', triggerX: 200, yPositions: [120, 200], spacingX: 40 },
  { id: 'wave-2', triggerX: 600, yPositions: [140, 280, 420], spacingX: 50 },
  { id: 'wave-3', triggerX: 1000, yPositions: [100, 200, 300], spacingX: 40 },
  { id: 'wave-4', triggerX: 1600, yPositions: [180, 360], spacingX: 60 },
  { id: 'wave-5', triggerX: 2100, yPositions: [120, 240, 360, 420], spacingX: 35 },
  { id: 'wave-6', triggerX: 2700, yPositions: [160, 260], spacingX: 70 }
] as const;
