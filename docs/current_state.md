# Current State

## Summary
Phase 3 is implemented: a scrolling Stage 1 greybox with terrain, hazards, scripted waves, checkpoints, and a stage end gate. Phase 1 and 2 systems remain intact.

## What exists right now
- Player ship entity with smooth WASD + arrow key movement and camera-bound clamping
- Continuous primary fire with cooldown; charge beam fires on release after charge threshold
- Drone pod with FRONT / REAR / DETACHED states, toggled by X
- Drone follows offsets (front/rear), lerps when detached, and fires with the player
- Drone knockback vs enemies (does not auto-kill)
- Dummy enemies spawned by scripted wave triggers and cleaned up off-screen
- Collision handling for bullets vs enemies, beam vs enemies, drone vs enemies, and player vs enemies
- Scrolling camera that advances the world at constant speed
- Terrain blocks (static) that kill the player on collision
- Laser hazard strips that kill the player on overlap
- Checkpoints that reset camera, enemies, bullets, and wave progression on death
- Stage end gate and STAGE CLEAR overlay (score summary + restart)
- Minimal HUD showing Score, Lives, Drone state, Charge state, and debug info

## What to do next
Expand Phase 4 per docs/phases.md when ready (boss encounter).

## How to run
- `npm install`
- `npm run dev`
Open the local URL printed by Vite.

## Verification
- Move with WASD/arrow keys; confirm player stays within the camera view as it scrolls.
- Hold Space briefly to fire normal bullets; hold longer to enter charge mode and release for a beam.
- Press X to cycle Drone state: FRONT -> REAR -> DETACHED -> FRONT.
- Observe the camera scrolling right at a constant speed.
- Navigate through terrain; confirm collision causes player death and respawn.
- Touch hazard strips; confirm player death.
- Confirm waves spawn at consistent camera positions.
- Lose a life and verify respawn at the last checkpoint with enemies cleared and waves reset.
- Reach the stage end gate; confirm STAGE CLEAR overlay and restart on Enter.

## Assumptions made
- Scrolling uses camera movement (Option A). Camera scrollX is the source of truth for spawns/cleanup.
- Checkpoints are at world X positions 0, 1200, and 2400.
- Player collision with terrain or hazards causes immediate death.
- Drone uses knockback on overlap instead of destroying enemies.
- Stage ends when camera scrollX reaches endX (3200).
- Debug HUD remains enabled for troubleshooting.
