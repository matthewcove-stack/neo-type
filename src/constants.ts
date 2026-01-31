export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const PLAYER_SETTINGS = {
  speed: 260,
  spawnX: 120,
  lives: 3,
  respawnDelayMs: 1000,
  width: 28,
  height: 18
} as const;

export const BULLET_SETTINGS = {
  speed: 520,
  cooldownMs: 160,
  width: 12,
  height: 4,
  spawnOffsetX: 20,
  cullPadding: 40
} as const;

export const ENEMY_SETTINGS = {
  speed: 140,
  spawnIntervalMs: 1200,
  width: 26,
  height: 18,
  spawnPaddingY: 28,
  spawnOffsetX: 40,
  maxHealth: 1,
  cullPadding: 60
} as const;

export const HUD_SETTINGS = {
  marginX: 16,
  marginY: 12,
  lineSpacing: 4
} as const;
