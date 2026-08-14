import "server-only";
import { createClient } from "../server";
import {
  Consultation,
  CreateConsultationDto,
  EditConsultationDto,
  SearchConsultationUserId,
} from "./types";

function mapConsultation(row: any): Consultation {
  return {
    id: row.id,
    userId: row.user_id,
    firstName: row.first_name,
    lastName: row.last_name,
    reason: row.reason,
    consultationAt: new Date(row.consultation_at).toISOString(),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

const consultantRepository = {
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
      .eq("userId", userId)
      .order("consultation_at", { ascending: false });

    if (error) throw error;
    return data.map(mapConsultation);
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

  cancel: async function (userId: string, id: string): Promise<Consultation> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("consultations").update({});

    if (error) throw error;
    return {} as Consultation;
  },
};

export default consultantRepository;
