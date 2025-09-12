import { createVoyage } from "voyage-ai-provider";
export const DEFAULT_PROFILE_PIC =
  "https://firebasestorage.googleapis.com/v0/b/supercx-ai.firebasestorage.app/o/profile-pic-placeholder.jpg?alt=media&token=d84141e6-61dd-4f0b-b828-775aa8dd84d2";

export const voyage = createVoyage({
  // custom settings
});

export const embeddingConfig = {
  model: voyage.textEmbeddingModel("voyage-3.5"),
  dimension: 1024,
  distance: "Cosine" as "Cosine" | "Euclid" | "Dot" | "Manhattan",
};
