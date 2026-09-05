import { externalAttrs } from "../../lib/links";
import type { ArtworkMetadata } from "../types";

const molnar = "https://en.wikipedia.org/wiki/Vera_Moln%C3%A1r";
const writeup = "/blog/recreating-vera-molnar-desordres/";

export const desordresMetadata: ArtworkMetadata = {
  slug: "desordres",
  title: "(Dés)Ordres study",
  year: 2026,
  description:
    "A small JavaScript and SVG study of Vera Molnár’s (Dés)ordres and the surprisingly little randomness it takes to make a perfect grid feel human.",
  caption: (
    <>
      <a href={writeup}>(dés)ordres study</a>
      {" · after "}
      <a href={molnar} {...externalAttrs(molnar)}>
        Vera Molnár
      </a>
    </>
  ),
  inspiration: "After Vera Molnár's (Dés)ordres ((Dis)orders), 1974.",
};
