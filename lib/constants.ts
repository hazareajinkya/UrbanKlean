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

export const SESSION_PASSWORD =
  process.env.SESSION_PASSWORD ?? "dM8d7#2%L!sA9pG*rT$wZ@fQ";

export const creditCosts = {
  query: 2,
} as const;

export const BOOK_DEMO_IFRAME =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1_55d95GVOjLV4i2tcGuUvvYi5C6WW59vDCaCOHRAynad1I2Cu-vVJqugAJ30mcQKyhJ-JLPaZ?gv=true";

export const WHITELISTED_EMAILS = [
  "support@magicalcx.com",
  "sakthiyapriyamba13@gmail.com",
  "akil@thestagetwo.com",
  "suryajayaraman@thestagetwo.com",
  "karthikcharles.411@gmail.com",
  "abhinav@magicalcx.com",
];
