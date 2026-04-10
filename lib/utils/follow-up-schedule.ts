import axios from "axios";
import type { IPerson } from "@/lib/types/person";

export const getLocalTimezone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

export const CRON_DEFAULT = "0 0 * * *";

const CRON_RANGES = {
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  day: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  weekday: { min: 0, max: 6 },
};

const isCronTokenInRange = ({
  token,
  key,
}: {
  token: string;
  key: keyof typeof CRON_RANGES;
}) => {
  const range = CRON_RANGES[key];
  if (token === "*") return true;
  if (/^\d+$/.test(token)) {
    const value = Number(token);
    return value >= range.min && value <= range.max;
  }
  if (/^\*\/\d+$/.test(token)) {
    const step = Number(token.split("/")[1]);
    return step > 0;
  }
  if (/^\d+-\d+$/.test(token)) {
    const [start, end] = token.split("-").map(Number);
    return start >= range.min && end <= range.max && start <= end;
  }
  if (/^\d+(,\d+)+$/.test(token)) {
    return token.split(",").every((part) => {
      const value = Number(part);
      return value >= range.min && value <= range.max;
    });
  }
  return false;
};

export const getCronValidationError = (cron: string) => {
  const value = cron.trim();
  const tokens = value.split(/\s+/);
  if (tokens.length !== 5) {
    return "Cron must have 5 parts: minute hour day month weekday.";
  }

  const keys = Object.keys(CRON_RANGES) as (keyof typeof CRON_RANGES)[];
  for (let index = 0; index < keys.length; index += 1) {
    if (!isCronTokenInRange({ token: tokens[index], key: keys[index] })) {
      return `Invalid ${keys[index]} value in cron expression.`;
    }
  }

  return "";
};

export const getTimezoneOptions = () => {
  const local = getLocalTimezone();

  if (typeof Intl.supportedValuesOf === "function") {
    const allTimezones = Intl.supportedValuesOf("timeZone");
    const prioritized = [local, "UTC", "Asia/Kolkata", "America/New_York"];
    const top = prioritized.filter(
      (timezone, index) => prioritized.indexOf(timezone) === index,
    );
    const rest = allTimezones.filter((timezone) => !top.includes(timezone));
    return [...top, ...rest.slice(0, 80)];
  }

  return [local, "UTC", "Asia/Kolkata", "America/New_York", "Europe/London"];
};

export const getAutoMappedValue = (args: { person: IPerson; index: number }) => {
  const { person, index } = args;
  const map: Record<number, string> = {
    1: person.name || "",
    2: person.company || "",
    3: person.title || "",
    4: person.location || "",
    5: person.emails?.[0]?.value || "",
    6: person.phones?.[0]?.value || "",
  };

  return map[index] || "";
};

type IWaTemplateParameter = {
  type: string;
  text?: string;
  image?: { link?: string };
  video?: { link?: string };
  document?: { link?: string };
};

type IWaSubmittedTemplateComponent = {
  type: string;
  parameters?: IWaTemplateParameter[];
};

const paramToSubmittedString = (param: IWaTemplateParameter) => {
  if (param.type === "text") return param.text || "";
  if (param.type === "image") return param.image?.link || "";
  if (param.type === "video") return param.video?.link || "";
  if (param.type === "document") return param.document?.link || "";
  return "";
};

export const parseParamsFromComponents = (
  components?: IWaSubmittedTemplateComponent[],
) => {
  const header = components?.find((item) => item.type === "header");
  const body = components?.find((item) => item.type === "body");

  const headerParams =
    header?.parameters?.map((param) => paramToSubmittedString(param)) || [];

  const bodyParams =
    body?.parameters?.map((param) =>
      param.type === "text" ? param.text || "" : "",
    ) || [];

  return { headerParams, bodyParams };
};

const assertValidIanaTimezone = (timezone: string) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(
      new Date(),
    );
  } catch {
    throw new Error(
      `Invalid timezone "${timezone}". Use a valid IANA name (e.g. America/New_York, UTC).`,
    );
  }
};

export const getFollowUpSaveErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
    ) {
      return (data as { message: string }).message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Failed to save follow-up schedule.";
};

export const toUtcTimestampFromLocal = (args: {
  date: string;
  time: string;
  timezone: string;
}) => {
  const { date, time, timezone } = args;
  const [year, month, day] = date.split("-").map((part) => Number(part));
  const [hour, minute] = time.split(":").map((part) => Number(part));

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute)
  ) {
    throw new Error("Please select a valid date and time.");
  }

  assertValidIanaTimezone(timezone);

  const getTzOffsetMs = (timestampMs: number) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(new Date(timestampMs));
    const map = Object.fromEntries(
      parts
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value]),
    );

    const asUtc = Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      Number(map.hour),
      Number(map.minute),
      Number(map.second),
    );

    return asUtc - timestampMs;
  };

  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  const initialOffset = getTzOffsetMs(naiveUtc);
  let correctedTimestamp = naiveUtc - initialOffset;
  const correctedOffset = getTzOffsetMs(correctedTimestamp);

  if (correctedOffset !== initialOffset) {
    correctedTimestamp = naiveUtc - correctedOffset;
  }

  return correctedTimestamp;
};

export const getDefaultOnceScheduleParts = () => {
  const nextHour = new Date(Date.now() + 60 * 60 * 1000);
  const pad2 = (n: number) => String(n).padStart(2, "0");
  return {
    date: nextHour.toISOString().slice(0, 10),
    time: `${pad2(nextHour.getHours())}:${pad2(nextHour.getMinutes())}`,
  };
};
