import {
  forbiddenReponse,
  getAuthenticatedUser,
  unauthorisedReponse,
} from "@/lib/auth/authenticate";
import { isAdmin } from "@/lib/auth/mapper";
import consultationService from "@/lib/supabase/consultations/service";
import { CreateConsultationDto } from "@/lib/supabase/consultations/types";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorisedReponse();
  if (isAdmin(user)) return forbiddenReponse();

  const consultation: CreateConsultationDto = await request.json();
  const created = await consultationService.create(user.id, consultation);
  return Response.json(created, { status: 201 });
}
