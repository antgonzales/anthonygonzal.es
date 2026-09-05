import type { ComponentType, ReactNode, SVGProps } from "react";

export interface ArtworkProps extends SVGProps<SVGSVGElement> {
  seed: number;
  /** 0 leaves the composition perfectly square; 1 is the shipped shake. */
  disorder?: number;
  /** Caps the nested squares per cell, for showing the build a layer at a time. */
  maxRings?: number;
  /** Cells per side. 8 reads at hero size; Molnár's 1974 plot is 17. */
  gridSize?: number;
  /** Share of squares struck out at random. 0 keeps the full stack; the shipped piece uses 0.35. */
  reduce?: number;
}

export interface ArtworkMetadata {
  slug: string;
  title: string;
  year: number;
  description: string;
  /** Rendered as-is, so it may carry markup such as a source link. */
  caption: ReactNode;
  inspiration?: string;
}

export interface ArtworkDefinition {
  metadata: ArtworkMetadata;
  Component: ComponentType<ArtworkProps>;
}
