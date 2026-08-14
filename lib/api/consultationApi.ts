import {
  Consultation,
  CreateConsultationDto,
  EditConsultationDto,
} from "../supabase/consultations/types";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "QUERY";

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
    all: async function (): Promise<Consultation[]> {
      return request<Consultation[]>("/api/consultations", "GET");
    },

    create: async function (
      consultation: CreateConsultationDto,
    ): Promise<Consultation> {
      return request("/api/consultations", "POST", {
        body: JSON.stringify(consultation),
      });
    },

    update: async function (id: string, consultation: EditConsultationDto) {
      return request(`/api/consultations/${id}`, "PATCH", {
        body: JSON.stringify(consultation),
      });
    },

    cancel: async function (id: string, consultation: EditConsultationDto) {
      return request(`/api/consultations/${id}/cancel`, "PATCH");
    },
  };
}

export default useConsultationApi;
