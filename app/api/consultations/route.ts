import {
  badResponse,
  forbiddenReponse,
  getAuthenticatedUser,
  unauthorisedReponse,
} from "@/lib/auth/authenticate";
import { isAdmin } from "@/lib/auth/mapper";
import {
  CreateConsultationDto,
  createConsultationSchema,
} from "@/lib/supabase/consultations/contracts";
import consultationService from "@/lib/supabase/consultations/service";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorisedReponse();
  if (isAdmin(user)) return forbiddenReponse();

  const body: CreateConsultationDto = await request.json();
  const result = createConsultationSchema.safeParse(body);

  if (!result.success) return badResponse(result, "Invalid consultation");

  const created = await consultationService.create(user.id, result.data);
  return Response.json(created, { status: 201 });
}
