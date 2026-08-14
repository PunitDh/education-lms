import consultationService from "@/lib/supabase/consultations/service";
import { ChangeStatusDto } from "@/lib/supabase/consultations/types";
import {
  forbiddenReponse,
  getAuthenticatedUser,
  unauthorisedReponse,
} from "@/lib/auth/authenticate";
import { HttpContext } from "@/app/api/types";
import { isAdmin } from "@/lib/auth/mapper";

export async function PATCH(request: Request, { params }: HttpContext) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorisedReponse();
  if (isAdmin(user)) return forbiddenReponse();

  const { id } = await params;
  const dto: ChangeStatusDto = await request.json();
  const consultation = await consultationService.changeStatus(
    user.id,
    id,
    dto.status,
  );

  return Response.json(consultation);
}
