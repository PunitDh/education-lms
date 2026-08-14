import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CurrentUser } from "./auth/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function getUserDisplayName(user: CurrentUser | undefined): string {
  if (!user) return "";
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  return fullName || user.email || "";
}

export function normalizeDateTime(datetime: Date): string {
  return datetime.toISOString();
}

export function formatDateTimeDisplay(datetime: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Australia/Melbourne",
  }).format(new Date(datetime));
}

export function formatDateTimeForPicker(value: string) {
  const date = new Date(value);

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
