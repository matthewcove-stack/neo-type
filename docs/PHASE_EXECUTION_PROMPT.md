# PHASE_EXECUTION_PROMPT

Use this prompt when running Codex for a specific phase. Replace bracketed items.

---

You are implementing **[PHASE NAME]** for the NEO-TYPE repo.

## Scope (must implement)
[Paste the phase scope bullets from docs/phases.md here.]

## Non-goals
[Paste the non-goals for this phase.]

## Acceptance criteria
- `npm install` works
- `npm run dev` launches and the phase features work
- `npm test` passes (add tests for any pure logic introduced)
- docs/current_state.md updated with:
  - What changed
  - How to run / verify
  - Any assumptions made

## Constraints
- Follow docs/codex_rules.md
- Keep placeholders simple (no external art)
- Keep the core loop at 60fps

## Deliverables
- Code changes implementing the phase
- Updated docs/current_state.md
- Any new assets under public/assets/

Proceed now.
