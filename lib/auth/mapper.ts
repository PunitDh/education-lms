import { JwtPayload } from "@supabase/supabase-js";
import { CurrentUser } from "./types";

export function mapJWTToCurrentUser(jwt: JwtPayload): CurrentUser {
  return {
    id: jwt.sub,
    email: jwt.email ?? "",
    firstName: jwt.user_metadata?.firstName ?? "",
    lastName: jwt.user_metadata?.lastName ?? "",
    role: jwt.app_metadata?.role === "admin" ? "admin" : "student",
  };
}

export function isAdmin(user: CurrentUser | null): boolean {
  return user?.role === "admin";
}
