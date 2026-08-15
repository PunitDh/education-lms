import { ZodSafeParseResult } from "zod";
import {
  ConsultationConflictError,
  ConsultationNotFoundError,
} from "../supabase/consultations/errors";

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
