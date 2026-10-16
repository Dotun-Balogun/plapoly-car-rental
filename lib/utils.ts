import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function formatNaira(value: number | string) {
  return naira.format(Number(value));
}

/** Parse a YYYY-MM-DD string as a calendar date (no timezone shifting). */
function parseDate(value: string) {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseDate(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}

export function daysBetween(start: string, end: string) {
  const ms = parseDate(end).getTime() - parseDate(start).getTime();
  return Math.round(ms / 86_400_000);
}

/** Today's date in Lagos as YYYY-MM-DD. */
export function todayInLagos() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date());
}

export function addDays(date: string, days: number) {
  const d = parseDate(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Accepts 0803..., 803..., +234803... and returns +234803... or null. */
export function normalizeNigerianPhone(input: string) {
  const digits = input.replace(/[\s\-()]/g, "");
  const match = digits.match(/^(?:\+?234|0)([789][01]\d{8})$/);
  return match ? `+234${match[1]}` : null;
}

/** Only allow redirects to paths inside this app. */
export function safeNextPath(next: FormDataEntryValue | string | null | undefined) {
  if (typeof next !== "string") return null;
  return next.startsWith("/") && !next.startsWith("//") ? next : null;
}
