import { HttpContext } from "@/app/api/types";
import {
  getAuthenticatedUser,
  unauthorisedReponse,
} from "@/lib/auth/authenticate";
import consultationService from "@/lib/supabase/consultations/service";

export async function PATCH(_: Request, { params }: HttpContext) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorisedReponse();

  const { id } = await params;
  const consultation = await consultationService.cancel(user.sub, id);

  return Response.json(consultation);
}
