import { useId } from "react";
import { createRandom } from "../random";
import type { ArtworkProps } from "../types";

const VIEWBOX_SIZE = 528;
const GRID_SIZE = 8;
const SPACING = 64;
const MARGIN = 40;
/* Paper around the grid. The squares already sit ~10 units inside the box, so
   this lifts the edge to ~4% of the grid width, as in Molnár's 1974 plot. */
const PADDING = 10;

interface Square {
  centerX: number;
  centerY: number;
  size: number;
}

function createComposition(seed: number): Square[] {
  const random = createRandom(seed);

  return Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
    const row = Math.floor(index / GRID_SIZE);
    const column = index % GRID_SIZE;
    const centerX = MARGIN + column * SPACING;
    const centerY = MARGIN + row * SPACING;
    const ringCount = 1 + Math.floor(random() * 4);
    const outerSize = 43 + random() * 17;

    return Array.from({ length: ringCount }, (_, layer) => {
      const progress = ringCount === 1 ? 0 : layer / (ringCount - 1);
      const size = outerSize * (1 - progress * 0.78);

      // Three draws that used to feed movement, speed, and phase. They are
      // discarded, but consuming them keeps the sequence — and so the
      // composition — identical for a given seed.
      random();
      random();
      random();

      return { centerX, centerY, size };
    });
  }).flat();
}

export default function Desordres({
  seed = 0x9c43,
  className,
  style,
  ...props
}: ArtworkProps) {
  const titleId = useId();
  const descriptionId = useId();
  const squares = createComposition(seed);

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
        A grid of nested squares of varying counts and sizes.
      </desc>
      {squares.map((square, index) => (
        <rect
          key={index}
          x={square.centerX - square.size / 2}
          y={square.centerY - square.size / 2}
          width={square.size}
          height={square.size}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
