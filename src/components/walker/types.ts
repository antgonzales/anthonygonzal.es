export type Variant = "scanning" | "checking" | "contributing" | "rejected";

export interface Step {
  nodes: Record<string, Variant>;
  badge?: Record<string, string>;
  caption: string;
}

export const VARIANT_STYLES: Record<
  Variant,
  { ring: string; bg: string; text: string; dot: string }
> = {
  scanning: {
    ring: "ring-2 ring-amber-600",
    bg: "bg-amber-400/10",
    text: "text-[var(--color-text)]",
    dot: "bg-amber-600",
  },
  checking: {
    ring: "ring-2 ring-blue-700",
    bg: "bg-blue-500/10",
    text: "text-[var(--color-text)]",
    dot: "bg-blue-700",
  },
  contributing: {
    ring: "ring-2 ring-green-700",
    bg: "bg-green-500/10",
    text: "text-[var(--color-text)]",
    dot: "bg-green-700",
  },
  rejected: {
    ring: "ring-1 ring-gray-400",
    bg: "bg-gray-500/5",
    text: "text-gray-400",
    dot: "bg-gray-400",
  },
};

export const LEGEND: { variant: Variant; label: string }[] = [
  { variant: "scanning", label: "Scanning" },
  { variant: "checking", label: "Checking" },
  { variant: "contributing", label: "Contributing" },
  { variant: "rejected", label: "No match" },
];
