import { VARIANT_STYLES } from "./types";
import type { Variant } from "./types";

interface NodeBoxProps {
  id: string;
  label: string;
  sublabel?: string;
  nodeVariants: Record<string, Variant>;
  badges: Record<string, string>;
}

export function NodeBox({
  id,
  label,
  sublabel,
  nodeVariants,
  badges,
}: NodeBoxProps) {
  const variant = nodeVariants[id] ?? null;
  const badge = badges[id] ?? null;
  const styles = variant ? VARIANT_STYLES[variant] : null;

  return (
    <div className="inline-flex flex-col items-start">
      <div
        className={[
          "inline-block font-mono text-[0.8125rem] px-2 py-0.5 rounded transition-all duration-200",
          styles
            ? `${styles.ring} ${styles.bg} ${styles.text}`
            : "ring-1 ring-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text)]",
          variant === "rejected" ? "opacity-50" : "opacity-100",
        ].join(" ")}
      >
        {label}
        {sublabel && (
          <span className="block text-[0.7rem] mt-0.5 opacity-70">
            {sublabel}
          </span>
        )}
      </div>
      {badge && (
        <div className="font-mono text-[0.75rem] mt-0.5 ml-1 text-green-700">
          → {badge}
        </div>
      )}
    </div>
  );
}

// A static (non-highlighted) node — for structural elements like <ul>, <li>, <table>
export function StaticNode({ label }: { label: string }) {
  return (
    <div className="inline-block font-mono text-[0.8125rem] px-2 py-0.5 rounded ring-1 ring-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text)]">
      {label}
    </div>
  );
}
