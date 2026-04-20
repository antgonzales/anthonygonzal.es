import { useState } from "react";
import { WalkerShell } from "./walker/WalkerShell";
import { VARIANT_STYLES } from "./walker/types";

// 24 budget/P&L rows × 3 columns (Budget, Actual, Variance)
// Every <td> carries aria-labelledby="[row-id] [col-id]"
// Total cells: 72. Total subtree walks: 144.
//
// Query: getByRole('cell', { name: 'Contractors Actual' })
// Contractors is row 13. The match cell is row 13, col 2 (Actual).
// Cells evaluated before match: 37 (rows 1–12 × 3, + row 13 col 1)
// Subtree walks before match: 74. Match cell adds 2 more → 76 total.

const ROWS = [
  "Salaries",
  "Benefits",
  "Payroll Tax",
  "Rent",
  "Utilities",
  "Equipment",
  "Software",
  "Travel",
  "Marketing",
  "Advertising",
  "Legal",
  "Insurance",
  "Contractors",
  "Consulting",
  "R&D",
  "Training",
  "Office Supplies",
  "Shipping",
  "Maintenance",
  "Depreciation",
  "Interest",
  "Taxes",
  "Miscellaneous",
  "Reserves",
];

const COLS = ["Budget", "Actual", "Variance"];
const TOTAL_CELLS = ROWS.length * COLS.length; // 72
const TOTAL_WALKS = TOTAL_CELLS * 2; // 144

// Match: "Contractors Actual" = row index 12, col index 1
const MATCH_ROW = 12;
const MATCH_COL = 1;
const MATCH_CELL_INDEX = MATCH_ROW * COLS.length + MATCH_COL; // 38 (0-indexed)

type Phase = "scanning" | "rows-1-6" | "rows-7-12" | "row-13-pre" | "match";

interface LargeTableStep {
  phase: Phase;
  cellsEvaluated: number;
  subtreeWalks: number;
  caption: string;
}

const steps: LargeTableStep[] = [
  {
    phase: "scanning",
    cellsEvaluated: 0,
    subtreeWalks: 0,
    caption: "getByRole('cell', { name: 'Contractors Actual' })",
  },
  {
    phase: "rows-1-6",
    cellsEvaluated: 18,
    subtreeWalks: 36,
    caption: "rows 1–6: no match",
  },
  {
    phase: "rows-7-12",
    cellsEvaluated: 36,
    subtreeWalks: 72,
    caption: "rows 7–12: no match",
  },
  {
    phase: "row-13-pre",
    cellsEvaluated: 37,
    subtreeWalks: 74,
    caption: "row 13, col 1: no match",
  },
  {
    phase: "match",
    cellsEvaluated: 38,
    subtreeWalks: 76,
    caption: "match ✓",
  },
];

export default function TableWalkerLarge() {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const phase = currentStep.phase;

  function dotVariantClass(cellIndex: number): string {
    const row = Math.floor(cellIndex / COLS.length);
    const col = cellIndex % COLS.length;

    if (phase === "scanning") {
      return `${VARIANT_STYLES.scanning.ring} ${VARIANT_STYLES.scanning.bg}`;
    }
    if (phase === "rows-1-6") {
      if (row < 6)
        return `${VARIANT_STYLES.rejected.ring} ${VARIANT_STYLES.rejected.bg} opacity-40`;
      return `${VARIANT_STYLES.scanning.ring} ${VARIANT_STYLES.scanning.bg}`;
    }
    if (phase === "rows-7-12") {
      if (row < 12)
        return `${VARIANT_STYLES.rejected.ring} ${VARIANT_STYLES.rejected.bg} opacity-40`;
      return `${VARIANT_STYLES.scanning.ring} ${VARIANT_STYLES.scanning.bg}`;
    }
    if (phase === "row-13-pre") {
      if (cellIndex < MATCH_CELL_INDEX - 1)
        return `${VARIANT_STYLES.rejected.ring} ${VARIANT_STYLES.rejected.bg} opacity-40`;
      if (cellIndex === MATCH_CELL_INDEX - 1)
        return `${VARIANT_STYLES.rejected.ring} ${VARIANT_STYLES.rejected.bg} opacity-40`;
      if (row === MATCH_ROW && col === MATCH_COL)
        return `${VARIANT_STYLES.scanning.ring} ${VARIANT_STYLES.scanning.bg}`;
      if (cellIndex > MATCH_CELL_INDEX)
        return `${VARIANT_STYLES.scanning.ring} ${VARIANT_STYLES.scanning.bg}`;
      return `${VARIANT_STYLES.scanning.ring} ${VARIANT_STYLES.scanning.bg}`;
    }
    // match phase
    if (cellIndex < MATCH_CELL_INDEX)
      return `${VARIANT_STYLES.rejected.ring} ${VARIANT_STYLES.rejected.bg} opacity-40`;
    if (cellIndex === MATCH_CELL_INDEX)
      return `${VARIANT_STYLES.contributing.ring} ${VARIANT_STYLES.contributing.bg}`;
    return "ring-1 ring-neutral-200 dark:ring-neutral-700 bg-neutral-50 dark:bg-neutral-900 opacity-30";
  }

  return (
    <WalkerShell
      label="Large table traversal walkthrough"
      caption={currentStep.caption}
      stepIndex={stepIndex}
      total={steps.length}
      isFirst={isFirst}
      isLast={isLast}
      onNext={() => setStepIndex((i) => Math.min(i + 1, steps.length - 1))}
      onPrev={() => setStepIndex((i) => Math.max(i - 1, 0))}
    >
      {/* Counters */}
      <div className="flex gap-6 font-mono text-xs text-neutral-500 dark:text-neutral-400 mb-4">
        <span>
          Cells evaluated:{" "}
          <span className="text-neutral-900 dark:text-neutral-100 font-medium">
            {currentStep.cellsEvaluated}
          </span>{" "}
          / {TOTAL_CELLS}
        </span>
        <span>
          Subtree walks:{" "}
          <span className="text-neutral-900 dark:text-neutral-100 font-medium">
            {currentStep.subtreeWalks}
          </span>{" "}
          / {TOTAL_WALKS}
        </span>
      </div>

      {/* Column header labels */}
      <div className="font-mono text-[0.7rem] text-neutral-500 dark:text-neutral-400 mb-1.5 flex gap-1.5 ml-[6.5rem]">
        {COLS.map((col) => (
          <span
            key={col}
            className="w-3 text-center text-[0.6rem] leading-none"
          >
            {col[0]}
          </span>
        ))}
      </div>

      {/* Dot grid — one row per budget line, 3 dots per row */}
      <div className="flex flex-col gap-1">
        {ROWS.map((rowLabel, rowIndex) => {
          const isMatchRow = rowIndex === MATCH_ROW;
          return (
            <div key={rowLabel} className="flex items-center gap-2">
              <span
                className={[
                  "font-mono text-[0.65rem] w-24 text-right shrink-0 leading-none",
                  isMatchRow && phase === "match"
                    ? "text-green-700 font-medium"
                    : "text-neutral-400 dark:text-neutral-500",
                ].join(" ")}
              >
                {rowLabel}
              </span>
              <div className="flex gap-1.5">
                {COLS.map((_, colIndex) => {
                  const cellIndex = rowIndex * COLS.length + colIndex;
                  const isMatchCell =
                    rowIndex === MATCH_ROW && colIndex === MATCH_COL;
                  return (
                    <div
                      key={colIndex}
                      title={`${rowLabel} ${COLS[colIndex]}`}
                      className={[
                        "w-3 h-3 rounded-sm transition-all duration-300",
                        isMatchCell && phase === "match"
                          ? "w-4 h-4 rounded"
                          : "",
                        dotVariantClass(cellIndex),
                      ].join(" ")}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Match callout on final step */}
      {phase === "match" && (
        <div className="mt-4 font-mono text-[0.8125rem] px-3 py-2 rounded ring-2 ring-green-700 bg-green-500/10 text-green-700 inline-block">
          {`<td aria-labelledby="row-contractors col-actual">$840K</td>`}
          <span className="block text-[0.75rem] mt-1">
            → "Contractors Actual" ✓
          </span>
        </div>
      )}
    </WalkerShell>
  );
}
