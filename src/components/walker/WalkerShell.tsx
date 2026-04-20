import { LEGEND, VARIANT_STYLES } from "./types";

interface WalkerShellProps {
  label: string;
  caption: string;
  stepIndex: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  onNext: () => void;
  onPrev: () => void;
  children: React.ReactNode;
}

export function WalkerShell({
  label,
  caption,
  stepIndex,
  total,
  isFirst,
  isLast,
  onNext,
  onPrev,
  children,
}: WalkerShellProps) {
  return (
    <div
      role="region"
      aria-label={label}
      className="border border-[var(--color-border)] rounded-md p-5 my-6 bg-[var(--color-bg)]"
    >
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-5" aria-label="Color legend">
        {LEGEND.map(({ variant, label: legendLabel }) => (
          <span
            key={variant}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--color-meta)]"
          >
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${VARIANT_STYLES[variant].dot}`}
            />
            {legendLabel}
          </span>
        ))}
      </div>

      {/* Tree diagram */}
      <div role="img" aria-label="DOM tree diagram" className="mb-5">
        {children}
      </div>

      {/* Caption */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="font-mono text-sm text-[var(--color-meta)] min-h-10 mb-4 leading-relaxed"
      >
        {caption}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={isFirst}
          aria-label="Previous step"
          className="px-3.5 py-1.5 font-mono text-sm border border-[var(--color-border)] rounded bg-transparent text-[var(--color-text)] cursor-pointer disabled:opacity-35 disabled:cursor-default"
        >
          ← Prev
        </button>
        <button
          onClick={onNext}
          disabled={isLast}
          aria-label="Next step"
          className="px-3.5 py-1.5 font-mono text-sm border border-[var(--color-border)] rounded bg-transparent text-[var(--color-text)] cursor-pointer disabled:opacity-35 disabled:cursor-default"
        >
          Next →
        </button>
        <span className="font-mono text-[0.8125rem] text-[var(--color-meta)] ml-1">
          Step {stepIndex + 1} of {total}
        </span>
      </div>
    </div>
  );
}
