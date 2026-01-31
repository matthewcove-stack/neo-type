# Current State

## Summary
Phase 1 is implemented: the player ship can move and fire, bullets and enemies use Arcade Physics, score/lives HUD updates, and a GAME OVER + restart flow is in place.

## What exists right now
- Player ship entity with smooth WASD + arrow key movement and screen-bound clamping
- Continuous firing (hold Space) with cooldown-timed bullets that move right and despawn off-screen
- Dummy enemies that spawn from the right, move left, have 1 HP, and are destroyed by bullets
- Collision handling for bullets vs enemies and player vs enemies
- Score increases per enemy destroyed and persists across player deaths
- Lives system (start at 3), respawn delay, GAME OVER text, and Enter-to-restart
- Minimal HUD showing Score and Lives

## What to do next
Expand Phase 2 per docs/phases.md when ready (enemy variety, scrolling, etc.).

## How to run
- `npm install`
- `npm run dev`
Open the local URL printed by Vite.

## Verification
- Move the player with WASD and arrow keys; confirm movement stays inside the screen.
- Hold Space to fire; confirm bullets travel right and despawn off-screen.
- Wait for enemies to spawn; shoot them to increase score.
- Collide with an enemy to lose a life; verify respawn after a short delay.
- Lose all lives to show GAME OVER; press Enter to restart and reset score/lives.

## Assumptions made
- Fire key is Space; restart key is Enter.
- Respawn delay is 1000ms with no temporary invulnerability.
- Bullet cooldown is 160ms; enemy spawn interval is 1200ms.
- Player/enemy/bullet are simple generated rectangles (no external assets).
- Enemy is destroyed on collision with the player to prevent repeat hits.
