import "server-only";
import { createClient } from "../server";
import {
  Consultation,
  CreateConsultationDto,
  SearchConsultationUserId,
} from "./types";

const consultantRepository = {
  all: async function (): Promise<Consultation[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("consultations")
      .select("*")
      .order("consultation_at", { ascending: false });

    if (error) throw error;
    return data;
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
    return data;
  },

  create: async function (
    consultation: CreateConsultationDto,
  ): Promise<Consultation> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("consultations").insert({});

    if (error) throw error;
    return {} as Consultation;
  },

  update: async function (
    consultation: CreateConsultationDto,
  ): Promise<Consultation> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("consultations").update({});

    if (error) throw error;
    return {} as Consultation;
  },

  cancel: async function (
    consultation: CreateConsultationDto,
  ): Promise<Consultation> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("consultations").update({});

    if (error) throw error;
    return {} as Consultation;
  },
};

export default consultantRepository;
