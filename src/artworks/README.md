# Artworks

Each artwork is a React component that can be used by Astro pages, MDX tutorials,
or another React application without depending on the site's layout.

## Structure

```text
artworks/
  artwork-name/
    ArtworkName.tsx  # rendering and animation
    index.ts         # metadata and exports
  index.ts           # public catalog
  random.ts          # shared deterministic generator
  types.ts           # shared component and metadata contracts
```

Artwork components accept the shared `ArtworkProps` contract:

- `seed` reproduces a composition and makes tutorial results testable.
- `disorder` scales the perturbation: `0` is exact, `1` is the shipped piece.
  Random draws happen either way, so the composition holds still as it changes.
- `maxRings` caps the nested shapes per cell, for showing a build a layer at a
  time.
- `animated={false}` provides a stable rendering for examples and screenshots.
- Standard SVG properties such as `className`, `aria-label`, and `style` pass
  through to the root SVG.

Components must render useful SVG `<title>` and `<desc>` content, clean up their
animation effects, and honor `prefers-reduced-motion`.

## Tutorial usage

```mdx
import { ArtworkFigure } from "../../artworks";

<ArtworkFigure
  client:visible
  artwork="desordres"
  seed={0x2a69e}
  className="artwork"
/>
```

`ArtworkFigure` resolves its component and metadata from the `artwork` property,
so attribution is consistent on the homepage and in tutorials. Import the
lower-level `Desordres` component only when an example intentionally needs the
unframed SVG.

Use `client:visible` for animated examples below the fold. Static examples can
omit the client directive and set `animated={false}`.

## Adding an artwork

Create its folder and component, declare its `ArtworkDefinition` beside it,
then export both from `artworks/index.ts`. Site-specific frames and captions
belong in `src/components`, not in the artwork itself.
