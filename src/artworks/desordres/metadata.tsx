import { externalAttrs } from "../../lib/links";
import type { ArtworkMetadata } from "../types";

const molnar = "https://en.wikipedia.org/wiki/Vera_Moln%C3%A1r";

export const desordresMetadata: ArtworkMetadata = {
  slug: "desordres",
  title: "(Dés)Ordres study",
  year: 2026,
  description:
    "A grid of nested squares whose inner boxes continually change size.",
  caption: (
    <>
      {"(dés)ordres study · after "}
      <a href={molnar} {...externalAttrs(molnar)}>
        Vera Molnár
      </a>
    </>
  ),
  inspiration: "After Vera Molnár's (Dés)ordres ((Dis)orders), 1973.",
};
