# Codex Rules

## Prime directive
Ship a playable vertical slice early. Optimize for iteration speed and clarity.

## Do not guess requirements that change user-visible behavior
If a decision affects gameplay feel, controls, difficulty, or UI, choose the *smallest reasonable default* and document it in docs/current_state.md.

## Asset policy
- Use simple placeholder sprites/shapes until mechanics are validated.
- Do not download copyrighted assets.
- Any generated/placeholder asset must be committed under public/assets/ with a short note in docs/current_state.md.

## Architecture policy
- Keep a clear separation between:
  - Scene orchestration (Phaser Scenes)
  - Game state (plain TypeScript objects)
  - Systems (movement, weapons, spawning, collision handling)
- Prefer deterministic step/update logic where possible.
- Avoid tight coupling between systems (use events and shared state).

## Testing policy
- Unit test pure logic (e.g., weapon cooldowns, drone/force state machine, scoring).
- Do not attempt to test Phaser rendering; test logic and state transitions.

## PR hygiene (even if working solo)
- Small commits with descriptive messages.
- Update docs/current_state.md when behavior changes.

## Performance
- Prefer object pooling for projectiles once firing rates increase.
- Keep allocations inside update loops minimal.
