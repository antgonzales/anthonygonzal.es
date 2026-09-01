import { useId } from "react";
import { createRandom } from "../random";
import type { ArtworkProps } from "../types";

const VIEWBOX_SIZE = 528;
const GRID_SIZE = 8;
/* Paper around the grid, ~4% of its width, as in Molnár's 1974 plot. */
const PADDING = 10;
/* Share of its cell each grid square spans. Uniform: in the plot every outer
   box is the same size, and the variety comes from the reduction below. */
const FILL = 0.84;
/* The offset series runs from the square's edge to `half / 2.01` — near the
   center without reaching it — in `OFFSETS` even steps. The step at offset 0
   is dropped, since a square offset by nothing is the square itself. */
const CENTER_DIVISOR = 2.01;
const OFFSETS = 9;
/* Share of all squares deleted at random. This is the whole engine of the
   piece: strike squares out of a uniform even stack and the cells come out
   with different depths and uneven gaps, while every square that survives is
   still exactly where the ladder put it. */
const REDUCE = 0.35;
/* Vertex displacement as a share of the cell, applied to X and Y of every
   corner independently. */
const JITTER_SHARE = 0.022;

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
  const outerHalf = (FILL * cell) / 2;
  // cell / 2.01 is the distance from a square's edge to just short of its
  // center; the series divides that into even steps.
  const interval = ((outerHalf * 2) / CENTER_DIVISOR / OFFSETS) * FILL;
  const jitter = JITTER_SHARE * cell * disorder;
  const rings = Math.min(OFFSETS, maxRings);

  return Array.from({ length: gridSize * gridSize }, (_, index) => {
    const row = Math.floor(index / gridSize);
    const column = index % gridSize;
    const centerX = cell * (column + 0.5);
    const centerY = cell * (row + 0.5);

    return Array.from({ length: rings }, (_, layer) => {
      const half = outerHalf - layer * interval;

      // Random Reduce, on every square rather than on whole cells. Draws are
      // spent whether or not the square survives, so the surviving squares do
      // not shift when the reduction changes.
      const kept = random() >= REDUCE;

      const corners = [
        { x: centerX - half, y: centerY - half },
        { x: centerX + half, y: centerY - half },
        { x: centerX + half, y: centerY + half },
        { x: centerX - half, y: centerY + half },
      ].map(({ x, y }) => ({
        x: x + (random() * 2 - 1) * jitter,
        y: y + (random() * 2 - 1) * jitter,
      }));

      return kept ? corners : null;
    }).filter((corners): corners is Corner[] => corners !== null);
  }).flat();
}

/* 20180921 in hex: 21 September 2018. */
export default function Desordres({
  seed = 0x133efb9,
  disorder = 1,
  maxRings = OFFSETS,
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
        A grid of cells, each holding concentric squares struck out at random,
        with every corner knocked slightly off true.
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
