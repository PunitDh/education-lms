import "server-only";
import { createClient } from "../server";
import { SearchConsultationUserId } from "./types";

const consultantRepository = {
  all: async function () {
    const supabase = await createClient();

    const { data, error } = await supabase.from("consultations").select("*");
    if (error) throw error;
    return data;
  },

  where: async function ({ userId }: SearchConsultationUserId) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("consultations")
      .select("*")
      .eq("userId", userId);
    if (error) throw error;
    return data;
  },
};

export default consultantRepository;
