import { useEffect, useId, useMemo, useRef } from "react";
import { createRandom } from "../random";
import type { ArtworkProps } from "../types";

const VIEWBOX_SIZE = 528;
const GRID_SIZE = 8;
const SPACING = 64;
const MARGIN = 40;

interface Square {
  centerX: number;
  centerY: number;
  size: number;
  movement: number;
  speed: number;
  phase: number;
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
      const movement =
        layer === 0
          ? 1.5 + random() * 2
          : 4 + random() * Math.min(12, size * 0.28);

      return {
        centerX,
        centerY,
        size,
        movement,
        speed: 0.7 + random() * 0.65,
        phase: random() * Math.PI * 2,
      };
    });
  }).flat();
}

export default function Desordres({
  seed = 0x9c43,
  animated = true,
  className,
  ...props
}: ArtworkProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const squares = useMemo(() => createComposition(seed), [seed]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !animated) return;

    const elements = [...svg.querySelectorAll<SVGRectElement>("rect")];
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let frame = 0;

    const draw = (milliseconds: number) => {
      const seconds = milliseconds / 1000;

      squares.forEach((square, index) => {
        const wave = Math.sin(seconds * square.speed + square.phase);
        const size = Math.max(4, square.size + wave * square.movement);
        const element = elements[index];
        if (!element) return;
        element.setAttribute("x", String(square.centerX - size / 2));
        element.setAttribute("y", String(square.centerY - size / 2));
        element.setAttribute("width", String(size));
        element.setAttribute("height", String(size));
      });

      frame = requestAnimationFrame(draw);
    };

    const updateMotion = () => {
      cancelAnimationFrame(frame);
      if (!motionPreference.matches) frame = requestAnimationFrame(draw);
    };

    updateMotion();
    if (typeof motionPreference.addEventListener === "function") {
      motionPreference.addEventListener("change", updateMotion);
    } else {
      motionPreference.addListener(updateMotion);
    }

    return () => {
      cancelAnimationFrame(frame);
      if (typeof motionPreference.removeEventListener === "function") {
        motionPreference.removeEventListener("change", updateMotion);
      } else {
        motionPreference.removeListener(updateMotion);
      }
    };
  }, [animated, squares]);

  return (
    <svg
      {...props}
      ref={svgRef}
      className={className}
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={`${titleId} ${descriptionId}`}
    >
      <title id={titleId}>(Dés)Ordres study</title>
      <desc id={descriptionId}>
        A grid of nested squares whose inner boxes continually change size.
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
