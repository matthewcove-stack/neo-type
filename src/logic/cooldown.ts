export const canFire = (nowMs: number, lastFireMs: number, cooldownMs: number): boolean => {
  if (cooldownMs <= 0) {
    return true;
  }

  return nowMs - lastFireMs >= cooldownMs;
};
