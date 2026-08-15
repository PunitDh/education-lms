import "server-only";
import { createClient } from "../supabase/server";
import { CurrentUser } from "./types";
import { mapJwtToUser } from "./mapper";
import { ZodSafeParseResult } from "zod";

export class ConsultationConflictError extends Error {}

export class ConsultationNotFoundError extends Error {}

export async function getAuthenticatedUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims.sub) return null;

  return mapJwtToUser(data.claims);
}

export function unauthorisedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbiddenResponse() {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}

export function badResponse<T>(result: ZodSafeParseResult<T>, error: string) {
  return Response.json(
    { error, issues: result.error?.issues },
    { status: 400 },
  );
}

export function conflictResponse(error: ConsultationConflictError) {
  return Response.json({ error: error.message }, { status: 409 });
}

export function notFoundResponse(error: ConsultationNotFoundError) {
  return Response.json({ error: error.message }, { status: 404 });
}
