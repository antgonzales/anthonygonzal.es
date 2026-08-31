import type { ComponentType, ReactNode, SVGProps } from "react";

export interface ArtworkProps extends SVGProps<SVGSVGElement> {
  seed?: number;
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
