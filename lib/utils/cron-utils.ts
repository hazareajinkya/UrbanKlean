export const cronToReadableText = (cron?: string) => {
  if (!cron) return "Recurring schedule";

  const normalized = cron.trim().replace(/\s+/g, " ");

  const knownMap: Record<string, string> = {
    "* * * * *": "Every minute",
    "*/10 * * * *": "Every 10 minutes",
    "0 * * * *": "Every hour",
    "0 0 * * *": "Every day at midnight",
    "0 12 * * *": "Every day at 12pm",
    "0 0 * * 0": "Every week",
    "0 0 1 * *": "First day of every month",
  };

  if (knownMap[normalized]) {
    return knownMap[normalized];
  }

  return `Cron ${normalized}`;
};
