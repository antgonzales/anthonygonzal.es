import { artworks, type ArtworkName } from "./registry";
import type { ArtworkProps } from "./types";

interface ArtworkFigureProps extends ArtworkProps {
  artwork: ArtworkName;
  figureClassName?: string;
  captionClassName?: string;
  showCaption?: boolean;
}

/** Resolves, renders, and captions a registered artwork by name. */
export default function ArtworkFigure({
  artwork,
  figureClassName,
  captionClassName,
  showCaption = true,
  ...artworkProps
}: ArtworkFigureProps) {
  const { Component, metadata } = artworks[artwork];

  return (
    <figure className={figureClassName}>
      <Component {...artworkProps} />
      {showCaption ? (
        <figcaption className={captionClassName}>{metadata.caption}</figcaption>
      ) : null}
    </figure>
  );
}
