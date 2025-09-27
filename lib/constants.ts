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
export const WA_PHONE_ID = "440211032500301";
export const PAGE_ACCESS_TOKEN =
  "EAASlSFQSI7wBPp4FCdcVkGB4ZBpYYvDWIET4kXZA1ZBPgqgKXExBDtZBfpaPizIZAztNwC3ZAMdmGgWKZCLFZAOkZCZChWTj3I5ePaqP9pmomGbLQljZAArMKe6AbZCCli1cNRXQ50yg88HXxLvK9TsxDaY1twWIIz1U0FUVZAkS2T8scgyHhMDZCwB9bHwQboIPnKlpaUiR9ZAL1MUfbnhsQ5yYZC5ME9FFKZA8obtrr50FxzTgLcHR4fz4ZD";

export const INSTA_ID = "17841473564869425";

export const FB_ID = "776850275516982";

export const FB_APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID ?? "";
export const FB_APP_SECRET = process.env.FB_APP_SECRET ?? "";
export const FB_REDIRECT_URI = process.env.NEXT_PUBLIC_FB_REDIRECT_URI ?? "";

export const FB_PAGE_ACCESS_TOKEN = process.env.FB_MESSENGER_ACCESS_TOKEN;
export const INSTA_PAGE_ACCESS_TOKEN = process.env.INSTA_IG_ACCESS_TOKEN;

export const SESSION_PASSWORD =
  process.env.SESSION_PASSWORD ?? "dM8d7#2%L!sA9pG*rT$wZ@fQ";

export const INSTAGRAM_APP_ID = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID ?? "";
export const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET ?? "";
export const INSTAGRAM_REDIRECT_URI =
  process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI ??
  "http://localhost:3000/api/oauth/instagram";

// "EAASlSFQSI7wBPktYHjZBGXkzsY1hZCrqglpwSdJJva0o1ydYZA8mJ4NIoKtwZC3zPBqroPhZC73tDQ4aTRpQZCiuSOMdtAQkZBO2M2eKbmHaiB6KaZCByhloqgUxY25ZAJEVMYCp6AYaQYgt6BO1da3RniKb1OFRXCp4HlRIHGyS0qR3OYnu861XSOHOocDhHYZADnw5mzDAp3SmHsJEhy1psqjSt4PRU6YAGIZCDr6fg2yODWC7wZDZD";
// "EAASlSFQSI7wBPraYhlTb5ZCJkkJHpvLCmiJyw9KeOeXw519QJ0KJpdxnrxHDVGudVkZBvS3bTDs8wAHjRw08iiGxcKhQoTlTPFSKcjZCb4PmFM05mqy6axtMsfQZBhQMbfDjMlnuNJzy8s8rTkz2WG7ktzpZAkuF5GlLqjqfxMfOFXgfjYXZBrjVsl9xBclS6uZBB25TSqpucJf65lTsy7XXVXq4jHFNXiCXwfkShOK8CFHgBMZD";
// "EAASlSFQSI7wBO9ooSFqNikeRq5DxwFz48nj9MinVmCFlnE8cg1UN26jW2mIb5bZB2sqWD0BHXwv2X4TXSF6OY44thQcUZChKockexxgKfTb8EZBVykh3tTyzFbqbMaFESu0Gt2wTDyY1bGuyTLucj8S58MMxcGn2jd2lA4ZB6fZCVG8U9V1HDeuvx61mzBkPlFwZDZD";
// "EAASlSFQSI7wBPVN7IMwMK8fupZAviZBZAkARaRONGoxcmimOZAMUGgMRxCPQFMNZBzdL8HiEGQVeSCzZAMg1fwZAc7cckAa7pohu4gLLiq0kVU3WWXI9EDNZBsQ9Fi4hzhODavJW2IDB4fzDoawkCtP7ReGOHApwhXLma9dNdWeISjtUyjXtsrZBts1UfDBd05QgcqccsZCAgupqoOXF3uywnZBMscD05otNZCn9wBgTN4pRrSUPhAZDZD";
// "EAALyuiJEEXcBPd6xZCavU8AsMZAGDUoDZBuAZC3c6ORQer0ZB99vbP61ZBHJWP3scJz69XDhOicY0AecT5vWXZC0vcZAjZCvWqSv7jPNX0TZCGVGynCWwdZCq3SAr35mGzcqeA3lYlYaMRJNgpvXuq7ORZBZBhFgmvA0QcTHXsL6RUA7BQWbJTSVZBYYnanS3d9YAzbpFTkwZDZD";
// "EAALyuiJEEXcBPeufwgbePTgZASxnG9vuMBkwMTBzZBXL5ZCpVDejMwXDla4KfekDPjRwj9kvoaJKF9Lc1Rd6hJuyGLZAGlVNPMT4bOXPk7oBhGdhDMFaCzIpcH5wpTmcZAW4usGwLCbizBTCdbY4QZB9Vd4r91IAXaEkzBnez9wcJspdvZBDjDr6ZCRjPop3f9fuLn9ugmklr3dp9ZBNDu9NZB1VZCXwjQNcsjKmgnjV8IZAKpZBXfgZDZD";
