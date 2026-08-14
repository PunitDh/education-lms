import consultationService from "@/lib/supabase/consultations/service";
import { EditConsultationDto } from "@/lib/supabase/consultations/types";
import { HttpContext } from "../../types";
import {
  getAuthenticatedUser,
  unauthorisedReponse,
} from "@/lib/auth/authenticate";

export async function PATCH(request: Request, { params }: HttpContext) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorisedReponse();

  const { id } = await params;
  const dto: EditConsultationDto = await request.json();
  const consultation = await consultationService.update(user.sub, id, dto);

  return Response.json(consultation);
}
