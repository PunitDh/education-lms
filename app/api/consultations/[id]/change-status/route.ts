import consultationService from "@/lib/supabase/consultations/service";
import {
  badResponse,
  forbiddenReponse,
  getAuthenticatedUser,
  unauthorisedReponse,
} from "@/lib/auth/authenticate";
import { HttpContext } from "@/app/api/types";
import { isAdmin } from "@/lib/auth/mapper";
import {
  ChangeStatusDto,
  changeStatusSchema,
} from "@/lib/supabase/consultations/contracts";

export async function PATCH(request: Request, { params }: HttpContext) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorisedReponse();
  if (isAdmin(user)) return forbiddenReponse();

  const { id } = await params;
  const body: ChangeStatusDto = await request.json();
  const result = changeStatusSchema.safeParse(body);

  if (!result.success) return badResponse(result, "Invalid status");

  const consultation = await consultationService.changeStatus(
    user.id,
    id,
    result.data.status,
  );

  return Response.json(consultation);
}
