import { useId } from "react";
import { createRandom } from "../random";
import type { ArtworkProps } from "../types";

const VIEWBOX_SIZE = 528;
const PADDING = 10;
const DEFAULT_GRID_SIZE = 8;
const DEFAULT_MAX_RINGS = 9;
const DEFAULT_REDUCE = 0.35;
const CELL_FILL = 0.84;
const CENTER_DIVISOR = 2.01;
const JITTER_SHARE = 0.022;

function placeOnGrid(cellIndex: number, gridSize: number, cellSize: number) {
  const row = Math.floor(cellIndex / gridSize);
  const column = cellIndex % gridSize;

  return [cellSize * (column + 0.5), cellSize * (row + 0.5)] as const;
}

function offsetInward(
  outerHalfSize: number,
  ringIndex: number,
  ringSpacing: number,
) {
  return outerHalfSize - ringIndex * ringSpacing;
}

function survivesStrikeOut(random: () => number, reduce: number) {
  return random() >= reduce;
}

function moveEveryCorner(
  centerX: number,
  centerY: number,
  halfSize: number,
  jitter: number,
  random: () => number,
) {
  return Array.from({ length: 4 }, (_, cornerIndex) => {
    const isLeftCorner = cornerIndex === 0 || cornerIndex === 3;
    const isTopCorner = cornerIndex < 2;
    const x = isLeftCorner ? centerX - halfSize : centerX + halfSize;
    const y = isTopCorner ? centerY - halfSize : centerY + halfSize;

    // Separate draws let every corner move independently on both axes.
    const jitteredX = x + (random() * 2 - 1) * jitter;
    const jitteredY = y + (random() * 2 - 1) * jitter;

    return `${jitteredX},${jitteredY}`;
  }).join(" ");
}

/* 20180921 in hex: 21 September 2018. */
export default function Desordres({
  seed = 0x133efb9,
  disorder = 1,
  maxRings = DEFAULT_MAX_RINGS,
  gridSize = DEFAULT_GRID_SIZE,
  reduce = DEFAULT_REDUCE,
  className,
  style,
  ...props
}: ArtworkProps) {
  const titleId = useId();
  const descriptionId = useId();
  const random = createRandom(seed);
  const cellSize = VIEWBOX_SIZE / gridSize;
  const outerHalfSize = (CELL_FILL * cellSize) / 2;

  // Dividing by 2.01 stops the rings just short of the center.
  const ringSpacing =
    ((outerHalfSize * 2) / CENTER_DIVISOR / DEFAULT_MAX_RINGS) * CELL_FILL;

  const jitter = JITTER_SHARE * cellSize * disorder;
  const cellCount = Math.max(0, Math.floor(gridSize * gridSize));
  const ringsPerCell = Math.max(
    0,
    Math.floor(Math.min(DEFAULT_MAX_RINGS, maxRings)),
  );

  const polygonPoints: string[] = [];

  for (let slotIndex = 0; slotIndex < cellCount * ringsPerCell; slotIndex++) {
    const cellIndex = Math.floor(slotIndex / ringsPerCell);
    const ringIndex = slotIndex % ringsPerCell;
    const [centerX, centerY] = placeOnGrid(cellIndex, gridSize, cellSize);
    const halfSize = offsetInward(outerHalfSize, ringIndex, ringSpacing);
    const survives = survivesStrikeOut(random, reduce);

    // Move the corners even on removed rings so changing `reduce` does not
    // shift the random values used by later rings.
    const points = moveEveryCorner(centerX, centerY, halfSize, jitter, random);

    if (survives) polygonPoints.push(points);
  }

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
      {polygonPoints.map((points, index) => (
        <polygon
          key={index}
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
