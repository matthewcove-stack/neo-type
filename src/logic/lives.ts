export type LifeResult = {
  lives: number;
  gameOver: boolean;
};

export const applyPlayerDeath = (currentLives: number): LifeResult => {
  const lives = Math.max(0, currentLives - 1);
  return {
    lives,
    gameOver: lives <= 0
  };
};
