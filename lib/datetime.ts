export const APP_TIME_ZONE = "Asia/Shanghai";

export function getAppDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: APP_TIME_ZONE,
    year: "numeric"
  }).formatToParts(date);

  return `${part(parts, "year")}-${part(parts, "month")}-${part(parts, "day")}`;
}

export function addDaysToDateString(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatAppTime(value: string | Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone: APP_TIME_ZONE
  }).format(toDate(value));
}

export function formatBriefDisplayDate(value: string | Date) {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    day: "numeric",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "numeric",
    timeZone: APP_TIME_ZONE,
    weekday: "short"
  }).formatToParts(toDate(value));

  return `${part(parts, "month")}月${part(parts, "day")}日 ${part(parts, "weekday")} ${part(parts, "hour")}:${part(parts, "minute")}`;
}

export function formatBriefDateFromDateString(dateString: string, time = "09:00") {
  const [year, month, day] = dateString.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const utcDate = new Date(
    Date.UTC(year, month - 1, day, hour - 8, minute, 0, 0)
  );

  return formatBriefDisplayDate(utcDate);
}

export function getUtcQueryWindow(dateString: string, paddingDays = 1) {
  return {
    end: `${addDaysToDateString(dateString, paddingDays)}T23:59:59Z`,
    start: `${addDaysToDateString(dateString, -paddingDays)}T00:00:00Z`
  };
}

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

function part(parts: Intl.DateTimeFormatPart[], type: string) {
  return parts.find((item) => item.type === type)?.value ?? "";
}
