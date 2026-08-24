import Desordres from "./desordres/Desordres";
import { desordresMetadata } from "./desordres/metadata";

export const artworks = {
  desordres: {
    Component: Desordres,
    metadata: desordresMetadata,
  },
} as const;

export type ArtworkName = keyof typeof artworks;
