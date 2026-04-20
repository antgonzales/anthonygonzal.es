import { useState } from "react";
import type { Step } from "./types";

export function useWalker<T extends Step>(steps: T[]) {
  const [stepIndex, setStepIndex] = useState(0);

  return {
    stepIndex,
    currentStep: steps[stepIndex],
    isFirst: stepIndex === 0,
    isLast: stepIndex === steps.length - 1,
    total: steps.length,
    next: () => setStepIndex((i) => Math.min(i + 1, steps.length - 1)),
    prev: () => setStepIndex((i) => Math.max(i - 1, 0)),
  };
}
