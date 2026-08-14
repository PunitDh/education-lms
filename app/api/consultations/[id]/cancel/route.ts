import { HttpContext } from "@/app/api/types";
import consultationService from "@/lib/supabase/consultations/service";

export async function PATCH(_: Request, { params }: HttpContext) {
  const { id } = await params;

  const consultation = await consultationService.cancel(id);

  return Response.json(consultation);
}
