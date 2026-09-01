import { useId } from "react";
import { createRandom } from "../random";
import type { ArtworkProps } from "../types";

const VIEWBOX_SIZE = 528;
const GRID_SIZE = 8;
/* Paper around the grid, ~4% of its width, as in Molnár's 1974 plot. */
const PADDING = 10;
/* Share of the cell the outermost square spans, before its own variation. */
const FILL = 0.78;
const FILL_RANGE = 0.12;
const MIN_RINGS = 1;
const RING_RANGE = 5;
/* Corner displacement at full disorder, in user units. Small against the
   square: the wobble reads because it accumulates down a stack of rings, not
   because any one box is bent far. */
const JITTER = 1.0;
/* No corner moves more than this share of its own half-width, so the
   innermost rings stay square. */
const JITTER_CEILING = 0.4;

interface Corner {
  x: number;
  y: number;
}

function createComposition(
  seed: number,
  disorder: number,
  maxRings: number,
  gridSize: number,
): Corner[][] {
  const random = createRandom(seed);
  const cell = VIEWBOX_SIZE / gridSize;

  return Array.from({ length: gridSize * gridSize }, (_, index) => {
    const row = Math.floor(index / gridSize);
    const column = index % gridSize;
    const centerX = cell * (column + 0.5);
    const centerY = cell * (row + 0.5);
    // Draw the full ring count either way, so capping it thins the stack
    // without moving anything that survives.
    const ringCount = Math.min(
      MIN_RINGS + Math.floor(random() * RING_RANGE),
      maxRings,
    );
    const outerHalf = ((FILL + random() * FILL_RANGE) * cell) / 2;

    return Array.from({ length: ringCount }, (_, layer) => {
      // Even absolute steps from the outer edge toward the center, so a deep
      // stack reads as concentric rather than as one box inside a much
      // smaller one.
      const half = outerHalf * (1 - layer / ringCount);
      const amount = Math.min(JITTER, half * JITTER_CEILING) * disorder;

      // Every corner is displaced on its own, so a square's four corners drift
      // apart instead of the whole box sliding. At disorder 0 the draws still
      // happen and resolve to zero, which holds the composition still while the
      // shake comes off.
      return [
        { x: centerX - half, y: centerY - half },
        { x: centerX + half, y: centerY - half },
        { x: centerX + half, y: centerY + half },
        { x: centerX - half, y: centerY + half },
      ].map(({ x, y }) => ({
        x: x + (random() * 2 - 1) * amount,
        y: y + (random() * 2 - 1) * amount,
      }));
    });
  }).flat();
}

export default function Desordres({
  seed = 0x2a69e,
  disorder = 1,
  maxRings = MIN_RINGS + RING_RANGE,
  gridSize = GRID_SIZE,
  className,
  style,
  ...props
}: ArtworkProps) {
  const titleId = useId();
  const descriptionId = useId();
  const squares = createComposition(seed, disorder, maxRings, gridSize);

  return (
    <svg
      {...props}
      className={className}
      style={{ backgroundColor: "var(--color-surface)", ...style }}
      viewBox={`${-PADDING} ${-PADDING} ${VIEWBOX_SIZE + PADDING * 2} ${
        VIEWBOX_SIZE + PADDING * 2
      }`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={`${titleId} ${descriptionId}`}
    >
      <title id={titleId}>(Dés)Ordres study</title>
      <desc id={descriptionId}>
        A grid of cells, each holding a stack of concentric squares with every
        corner knocked slightly off true.
      </desc>
      {squares.map((corners, index) => (
        <polygon
          key={index}
          points={corners.map(({ x, y }) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
