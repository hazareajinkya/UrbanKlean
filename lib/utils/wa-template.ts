export const extractVariablesCount = (text?: string) => {
  if (!text) return 0;
  const matches = text.match(/\{\{(\d+)\}\}/g);
  if (!matches?.length) return 0;
  const numbers = matches.map((match) =>
    Number.parseInt(match.replace(/\D/g, ""), 10),
  );
  return Math.max(...numbers);
};

/** Sorted unique placeholder indices as strings, e.g. ["1","3"] for `{{1}}` … `{{3}}`. */
export const getWaTemplateVariablePositions = (text?: string) => {
  if (!text) return [];
  const matches = text.match(/\{\{(\d+)\}\}/g) || [];
  const positions = matches.map((m) => m.replace(/[{}]/g, ""));
  const unique = Array.from(new Set(positions));
  unique.sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10));
  return unique;
};

export const findWaTemplateComponent = <T extends { type?: string }>(
  components: T[] | undefined,
  type: string,
) => components?.find((c) => c.type === type);

export const interpolateWaTemplateText = (args: {
  text: string;
  positions: string[];
  valuesByPosition: Record<string, string>;
}) => {
  const { text, positions, valuesByPosition } = args;
  let result = text;
  for (const pos of positions) {
    const val = valuesByPosition[pos] || `{{${pos}}}`;
    result = result.replace(new RegExp(`\\{\\{${pos}\\}\\}`, "g"), val);
  }
  return result;
};

export const buildWaBodySubmitComponent = (args: {
  positions: string[];
  valuesByPosition: Record<string, string>;
}): { type: "body"; parameters: { type: "text"; text: string }[] } | null => {
  const { positions, valuesByPosition } = args;
  if (positions.length === 0) return null;
  return {
    type: "body",
    parameters: positions.map((pos) => ({
      type: "text" as const,
      text: valuesByPosition[pos] || "",
    })),
  };
};

type WaHeaderComponentLike = {
  format?: string;
  text?: string;
};

export const getWaHeaderParameterSlotCount = (
  header?: WaHeaderComponentLike | null,
) => {
  if (!header?.format) return 0;
  if (header.format === "TEXT") return extractVariablesCount(header.text);
  if (
    header.format === "IMAGE" ||
    header.format === "VIDEO" ||
    header.format === "DOCUMENT"
  ) {
    return 1;
  }
  return 0;
};

type SubmitHeaderParam =
  | { type: "text"; text: string }
  | { type: "image"; image: { link: string } }
  | { type: "video"; video: { link: string } }
  | { type: "document"; document: { link: string } };

export const buildWaHeaderSubmitComponent = (args: {
  header: WaHeaderComponentLike;
  headerParams: string[];
}): { type: "header"; parameters: SubmitHeaderParam[] } | null => {
  const { header, headerParams } = args;
  if (headerParams.length === 0) return null;
  const { format } = header;
  if (format === "TEXT") {
    return {
      type: "header",
      parameters: headerParams.map((text) => ({ type: "text" as const, text })),
    };
  }
  const link = headerParams[0];
  if (format === "IMAGE") {
    return {
      type: "header",
      parameters: [{ type: "image", image: { link } }],
    };
  }
  if (format === "VIDEO") {
    return {
      type: "header",
      parameters: [{ type: "video", video: { link } }],
    };
  }
  if (format === "DOCUMENT") {
    return {
      type: "header",
      parameters: [{ type: "document", document: { link } }],
    };
  }
  return null;
};
