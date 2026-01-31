# AGENTS

## Project
Codename: **NEO-TYPE** (working title)
Genre: Horizontal side-scrolling shoot 'em up inspired by classic arcade design.

## Non-goals (for early phases)
- No online multiplayer.
- No procedural generation in v1.
- No complex RPG/meta progression (keep it arcade-first).
- No custom level editor in v1 (can be a later stretch).

## Truth hierarchy
If any docs conflict, **docs/current_state.md** is authoritative.

## Repo map
- docs/: intent, concept, phases, rules, prompts
- src/: game code (TypeScript + Phaser)
- public/assets/: placeholder art/audio (generated/simple)

## Local commands
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Tests: `npm test`
- Lint: `npm run lint`

## Style and constraints
- Target 60fps on typical desktop browsers.
- Keep code modular and testable (pure logic units where possible).
- Avoid adding heavy dependencies unless clearly justified.
- Use placeholder assets until the core loop is fun.
