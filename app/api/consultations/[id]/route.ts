import consultationService from "@/lib/supabase/consultations/service";
import { EditConsultationDto } from "@/lib/supabase/consultations/types";
import { HttpContext } from "../../types";
import {
  forbiddenReponse,
  getAuthenticatedUser,
  unauthorisedReponse,
} from "@/lib/auth/authenticate";
import { isAdmin } from "@/lib/auth/mapper";

export async function PATCH(request: Request, { params }: HttpContext) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorisedReponse();
  if (isAdmin(user)) return forbiddenReponse();

  const { id } = await params;
  const dto: EditConsultationDto = await request.json();
  const consultation = await consultationService.update(user.id, id, dto);

  return Response.json(consultation);
}
