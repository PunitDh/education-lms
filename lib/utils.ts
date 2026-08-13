import { JwtPayload } from "@supabase/supabase-js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function getUserDisplayName(user: JwtPayload | undefined): string {
  if (!user) return "";
  const { user_metadata: metadata } = user;

  const firstName = metadata?.firstName ?? "";
  const lastName = metadata?.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || user.email || "";
}
