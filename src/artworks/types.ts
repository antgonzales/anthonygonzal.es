import type { ComponentType, SVGProps } from "react";

export interface ArtworkProps extends SVGProps<SVGSVGElement> {
  seed?: number;
  animated?: boolean;
}

export interface ArtworkMetadata {
  slug: string;
  title: string;
  year: number;
  description: string;
  caption: string;
  inspiration?: string;
}

export interface ArtworkDefinition {
  metadata: ArtworkMetadata;
  Component: ComponentType<ArtworkProps>;
}
