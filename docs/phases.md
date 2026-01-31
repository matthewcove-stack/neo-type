# Phases

## Phase 0: Repo scaffold (done by this template)
Goal: Running dev server and a blank Phaser scene.

Acceptance:
- `npm run dev` shows a window with a moving test sprite or debug text.

## Phase 1: Core player + camera + bullets
Scope:
- Player ship movement (clamped to screen bounds)
- Primary fire (projectiles, cooldown)
- Basic enemy dummy that can be hit/destroyed
- Simple score increment
- Minimal HUD (score, lives)

Non-goals:
- No Drone yet
- No boss

## Phase 2: Drone state machine + charge beam
Scope:
- Drone states: front, rear, detached
- Drone collision blocking zone (simple)
- Charge beam (3 levels)
- Tests for Drone state transitions and charge logic

Non-goals:
- No complex Drone positioning UI

## Phase 3: Stage 1 greybox
Scope:
- Scrolling level with terrain blocks and hazards
- Enemy wave scripting (timed spawns)
- Checkpoints and respawn logic
- Stage end gate

Non-goals:
- No final art

## Phase 4: Boss 1
Scope:
- Boss entity with weak points, 2 phases
- Boss HP bar
- Basic win/lose states and restart

Non-goals:
- No fancy cutscenes

## Phase 5: Polish pass
Scope:
- Better hit feedback (flash, shake, particles)
- SFX + basic music loop
- Options: remap keys, volume sliders
- Performance pass (pooling)

Non-goals:
- No content expansion beyond Stage 1 + Boss 1
