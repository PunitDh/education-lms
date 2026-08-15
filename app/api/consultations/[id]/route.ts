import consultationService from "@/lib/supabase/consultations/service";
import { HttpContext } from "../../types";
import { getAuthenticatedUser } from "@/lib/auth/authenticate";
import { isAdmin } from "@/lib/auth/mapper";
import { editConsultationSchema } from "@/lib/supabase/consultations/contracts";
import {
  badResponse,
  conflictResponse,
  forbiddenResponse,
  notFoundResponse,
  unauthorisedResponse,
} from "@/lib/api/response";
import {
  ConsultationConflictError,
  ConsultationNotFoundError,
} from "@/lib/supabase/consultations/errors";

export async function PATCH(request: Request, { params }: HttpContext) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorisedResponse();
  if (isAdmin(user)) return forbiddenResponse();

  const { id } = await params;

  const body: unknown = await request.json();
  const result = editConsultationSchema.safeParse(body);

  if (!result.success) return badResponse(result, "Invalid consultation");

  try {
    const consultation = await consultationService.update(
      user.id,
      id,
      result.data,
    );

    return Response.json(consultation);
  } catch (error) {
    if (error instanceof ConsultationNotFoundError)
      return notFoundResponse(error);
    if (error instanceof ConsultationConflictError)
      return conflictResponse(error);
    throw error;
  }
}
