import { CreateConsultationDto, EditConsultationDto } from "../supabase/consultations/contracts";
import {
  Consultation,
  ConsultationStatus,
} from "../supabase/consultations/types";

type HttpMethod = "GET" | "POST" | "PATCH";

async function request<T>(
  url: string,
  method: HttpMethod,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function useConsultationApi() {
  return {
    create: async function (
      consultation: CreateConsultationDto,
    ): Promise<Consultation> {
      return await request("/api/consultations", "POST", {
        body: JSON.stringify(consultation),
      });
    },

    update: async function (
      id: string,
      consultation: EditConsultationDto,
    ): Promise<Consultation> {
      return await request(`/api/consultations/${id}`, "PATCH", {
        body: JSON.stringify(consultation),
      });
    },

    changeStatus: async function (
      id: string,
      status: ConsultationStatus,
    ): Promise<Consultation> {
      return await request(`/api/consultations/${id}/change-status`, "PATCH", {
        body: JSON.stringify({
          status,
        }),
      });
    },
  };
}

export default useConsultationApi;
