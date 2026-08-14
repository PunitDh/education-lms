import "server-only";
import { createClient } from "../server";
import {
  Consultation,
  ConsultationStatus,
  CreateConsultationDto,
  EditConsultationDto,
  SearchConsultationUserId,
} from "./types";
import { Database } from "../database.types";

function mapConsultation(
  row: Database["public"]["Tables"]["consultations"]["Row"],
): Consultation {
  return {
    id: row.id,
    userId: row.user_id,
    firstName: row.first_name,
    lastName: row.last_name,
    reason: row.reason,
    consultationAt: new Date(row.consultation_at).toISOString(),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    status: mapConsultationStatus(row.status),
  };
}

function mapConsultationStatus(status: string): ConsultationStatus {
  switch (String(status).trim().toLowerCase()) {
    case "scheduled":
      return ConsultationStatus.SCHEDULED;
    case "completed":
      return ConsultationStatus.COMPLETED;
    case "cancelled":
      return ConsultationStatus.CANCELLED;
    default:
      throw new Error(`Unknown consultation status: ${status}`) as never;
  }
}

const consultationRepository = {
  all: async function (): Promise<Consultation[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("consultations")
      .select("*")
      .order("consultation_at", { ascending: false });

    if (error) throw error;
    return data.map(mapConsultation);
  },

  where: async function ({
    userId,
  }: SearchConsultationUserId): Promise<Consultation[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("consultations")
      .select("*")
      .eq("user_id", userId)
      .order("consultation_at", { ascending: false });

    if (error) throw error;
    return data.map(mapConsultation);
  },

  findById: async function (id: string): Promise<Consultation> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("consultations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return mapConsultation(data);
  },

  create: async function (
    userId: string,
    consultation: CreateConsultationDto,
  ): Promise<Consultation> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("consultations")
      .insert({
        user_id: userId,
        first_name: consultation.firstName,
        last_name: consultation.lastName,
        reason: consultation.reason,
        consultation_at: consultation.consultationAt,
      })
      .select()
      .single();

    if (error) throw error;
    return mapConsultation(data);
  },

  update: async function (
    userId: string,
    id: string,
    consultation: EditConsultationDto,
  ): Promise<Consultation> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("consultations")
      .update({
        first_name: consultation.firstName,
        last_name: consultation.lastName,
        reason: consultation.reason,
        consultation_at: consultation.consultationAt,
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return mapConsultation(data);
  },

  changeStatus: async function (
    userId: string,
    id: string,
    status: ConsultationStatus,
  ): Promise<Consultation> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("consultations")
      .update({
        status,
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return mapConsultation(data);
  },
};

export default consultationRepository;
