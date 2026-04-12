

# Arrange Constellation Nodes in an Organic Orbit Around the Figure

## Problem
The planet constellation nodes are placed in a straight horizontal line at `y = 40` (top of the scene), far from the figure. The beams descend as rigid straight lines, creating an unnatural, distant look.

## Changes (all in `src/components/AstralLightReveal.tsx`)

### 1. Replace linear spread with elliptical orbit positioning (lines 238-246)
- Instead of `y = 40` for all nodes, compute positions on an **elliptical orbit** centered around the figure (`FIG_CX`, `~FIG_CORE_Y`)
- Use an ellipse with `rx ≈ 110, ry ≈ 130` — close enough to surround the figure but with enough clearance to not overlap
- Distribute planets at angular intervals around the ellipse (not evenly — add slight randomized angular offsets for organic feel)
- Each planet gets a unique angle: `baseAngle = (idx / count) * 2π + smallRandomOffset`

### 2. Adjust constellation mini-star offsets (lines 40-51)
- Reduce the star offset ranges from ±6 to ±4 so mini constellation patterns stay tighter around each node at closer range

### 3. Curve the energy beams (lines 441-498)
- Replace straight `<line>` beams with `<path>` using a quadratic Bézier curve (`Q` command)
- Control point offset perpendicular to the beam direction for a natural arc
- This makes beams flow organically toward the chest instead of rigid straight lines

### 4. Keep beam gradient and animation logic identical
- Same gradient definitions, same traveling particle, same impact flash — just follow the curved path instead of straight line

## Technical detail

Ellipse formula for node positions:
```
angle = (index / total) * 2π + jitter
x = FIG_CX + rx * cos(angle)
y = FIG_CORE_Y + ry * sin(angle)
```

Bézier control point for curved beams:
```
midX = (nodeX + FIG_CX) / 2 + perpOffset
midY = (nodeY + FIG_CHEST_Y) / 2 + perpOffset
path = `M ${nodeX} ${nodeY} Q ${midX} ${midY} ${FIG_CX} ${FIG_CHEST_Y}`
```

## Scope
- Only `src/components/AstralLightReveal.tsx` modified
- No changes to figure, timing, colors, or other components

