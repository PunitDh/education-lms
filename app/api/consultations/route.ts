import {
  getAuthenticatedUser,
  unauthorisedReponse,
} from "@/lib/auth/authenticate";
import consultationService from "@/lib/supabase/consultations/service";
import { CreateConsultationDto } from "@/lib/supabase/consultations/types";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorisedReponse();

  const consultation: CreateConsultationDto = await request.json();
  const created = await consultationService.create(user.sub, consultation);
  return Response.json(created, { status: 201 });
}

export async function GET() {
  const consultations = await consultationService.fetchAll();
  return Response.json(consultations);
}
