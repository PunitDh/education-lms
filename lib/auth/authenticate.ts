import "server-only";
import { createClient } from "../supabase/server";
import { CurrentUser } from "./types";
import { mapJwtToUser } from "./mapper";

export async function getAuthenticatedUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims.sub) return null;

  return mapJwtToUser(data.claims);
}
