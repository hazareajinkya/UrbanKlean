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

export const WA_WINDOW_EXPIRATION_HOURS = 24;
export const WA_PHONE_ID = "757524910784767";

export const PAGE_ACCESS_TOKEN =
  "EAALyuiJEEXcBPeufwgbePTgZASxnG9vuMBkwMTBzZBXL5ZCpVDejMwXDla4KfekDPjRwj9kvoaJKF9Lc1Rd6hJuyGLZAGlVNPMT4bOXPk7oBhGdhDMFaCzIpcH5wpTmcZAW4usGwLCbizBTCdbY4QZB9Vd4r91IAXaEkzBnez9wcJspdvZBDjDr6ZCRjPop3f9fuLn9ugmklr3dp9ZBNDu9NZB1VZCXwjQNcsjKmgnjV8IZAKpZBXfgZDZD";
