import "server-only";
import { createClient } from "../supabase/server";
import { JwtPayload } from "@supabase/supabase-js";

export async function getAuthenticatedUser(): Promise<JwtPayload | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims.sub) return null;

  return data.claims;
}

export function unauthorisedReponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function isAdmin(user: JwtPayload): boolean {
  return user.app_metadata?.role === "admin";
}
