import consultationService from "@/lib/supabase/consultations/service";
import { CreateConsultationDto } from "@/lib/supabase/consultations/types";

export async function POST(request: Request) {
  const consultation: CreateConsultationDto = await request.json();
  const created = await consultationService.create(consultation);
  return Response.json(created, { status: 201 });
}

export async function GET() {
  const consultations = await consultationService.fetchAll();
  return Response.json(consultations);
}
