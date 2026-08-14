import consultationService from "@/lib/supabase/consultations/service";
import { ChangeStatusDto } from "@/lib/supabase/consultations/types";
import {
  getAuthenticatedUser,
  unauthorisedReponse,
} from "@/lib/auth/authenticate";
import { HttpContext } from "@/app/api/types";

export async function PATCH(request: Request, { params }: HttpContext) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorisedReponse();

  const { id } = await params;
  const dto: ChangeStatusDto = await request.json();
  const consultation = await consultationService.changeStatus(
    user.sub,
    id,
    dto.status,
  );

  return Response.json(consultation);
}
