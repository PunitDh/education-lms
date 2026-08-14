import consultationService from "@/lib/supabase/consultations/service";
import { EditConsultationDto } from "@/lib/supabase/consultations/types";
import { HttpContext } from "../../types";

export async function PATCH(request: Request, { params }: HttpContext) {
  const { id } = await params;
  const dto: EditConsultationDto = await request.json();
  const consultation = await consultationService.update(id, dto);

  return Response.json(consultation);
}
