import "server-only";
import { createClient } from "../server";

const consultantRepository = {
  all: async function () {
    const supabase = await createClient();

    const { data, error } = await supabase.from("consultations").select("*");
    if (error) throw error;
    return data;
  },
};

export default consultantRepository;
