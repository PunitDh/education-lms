import consultationService from "@/lib/supabase/consultations/service";
import {
  badResponse,
  conflictResponse,
  ConsultationConflictError,
  ConsultationNotFoundError,
  forbiddenResponse,
  getAuthenticatedUser,
  notFoundResponse,
  unauthorisedResponse,
} from "@/lib/auth/authenticate";
import { HttpContext } from "@/app/api/types";
import { isAdmin } from "@/lib/auth/mapper";
import { changeStatusSchema } from "@/lib/supabase/consultations/contracts";

export async function PATCH(request: Request, { params }: HttpContext) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorisedResponse();
  if (isAdmin(user)) return forbiddenResponse();

  const { id } = await params;
  const body: unknown = await request.json();
  const result = changeStatusSchema.safeParse(body);

  if (!result.success) return badResponse(result, "Invalid status");

  try {
    const consultation = await consultationService.changeStatus(
      user.id,
      id,
      result.data.status,
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
