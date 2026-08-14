import "server-only";
import { createClient } from "../supabase/server";
import { CurrentUser } from "./types";
import { mapJWTToCurrentUser } from "./mapper";

export async function getAuthenticatedUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims.sub) return null;

  return mapJWTToCurrentUser(data.claims);
}

export function unauthorisedReponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbiddenReponse() {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}
