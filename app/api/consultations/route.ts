import {
  badResponse,
  forbiddenResponse,
  getAuthenticatedUser,
  unauthorisedResponse,
} from "@/lib/auth/authenticate";
import { isAdmin } from "@/lib/auth/mapper";
import { createConsultationSchema } from "@/lib/supabase/consultations/contracts";
import consultationService from "@/lib/supabase/consultations/service";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return unauthorisedResponse();
  if (isAdmin(user)) return forbiddenResponse();

  const body: unknown = await request.json();
  const result = createConsultationSchema.safeParse(body);

  if (!result.success) return badResponse(result, "Invalid consultation");

  const created = await consultationService.create(user.id, result.data);
  return Response.json(created, { status: 201 });
}
