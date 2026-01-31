# Game Concept: NEO-TYPE

## High concept
A tactical horizontal shmup where the player's detachable **Drone** is both a weapon and a shield.
Progression is about learning routes and patterns, not grinding stats.

## Core loop
1. Navigate scrolling space + terrain
2. Engage enemy formations and hazards
3. Collect powerups and manage the Drone position
4. Reach checkpoint(s)
5. Defeat stage boss
6. Score + rank summary, retry for mastery

## Session length
- One stage: 4-6 minutes (initial target)
- Full run v1: 15-25 minutes (3-5 stages, later)

## Controls (default)
- Move: WASD / Arrow keys
- Fire: Z / Space
- Charge: hold Fire
- Drone: X (toggle attach/detach); if attached, tap X to cycle Front/Rear
- Missiles: C (optional secondary)
- Pause: Esc

(Controls configurable later.)

## Signature mechanic: Drone (R-Type-like Force)
The Drone has three states:
- **Attached Front**: increases forward DPS, blocks incoming shots in a small area.
- **Attached Rear**: defensive retreat option + rear fire.
- **Detached**: Drone moves to a commanded offset and fires independently.

Key design: Drone is durable (no health) but has **reposition delay** so it's not a free win.

### Drone movement model (proposal)
- When detached, Drone is a follower with spring smoothing toward a target offset.
- Player can "nudge" the target offset with a modifier key later; for v1 keep it simple:
  detached Drone sits ~120px ahead of the player on the x-axis.

## Weapons
### Primary shot
- Fast, low damage, continuous fire.

### Charge beam
- Hold to charge through 3 visible levels.
- Release fires a beam with:
  - High damage
  - Piercing (through small enemies)
  - Short cooldown
- Risk: charging reduces normal fire output.

### Missiles (optional)
- Low cadence, ground/terrain hugging or straight.
- Good for enemies in recesses.

## Enemies
- **Fodder**: simple patterns
- **Turrets**: anchored, aim or pattern fire
- **Armored**: requires beam or Drone placement
- **Swarmers**: punish static play

## Boss design principles
- Big silhouette, readable tells.
- Multiple weak points.
- Two phases minimum:
  1) pattern introduction
  2) pattern escalation / new attack
- Reward positioning (Drone blocks certain volleys).

## Difficulty and fairness
- One-hit death (arcade style) for v1.
- Frequent checkpoints.
- Pattern readability: bullets contrast strongly against backgrounds.
- "Fair spawns": avoid spawning unavoidable hits.

## Visual style
- Pixel-art inspired, but can be crisp vector placeholders in prototype.
- Biomechanical enemies: organic shapes fused with machinery.
- Parallax backgrounds with subtle motion.
- Optional post-processing later: CRT bloom/scanlines (off by default).

## Audio style
- Minimalist, tense synth.
- Punchy SFX: shot, beam release, hit confirm, explosion, pickup.
