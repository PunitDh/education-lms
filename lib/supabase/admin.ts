import "server-only";
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
  "1e54eba1-e9ea-44c3-a74d-fafbfe6a5411",
  {
    app_metadata: {
      role: "admin",
    },
  },
);

if (error) throw error;

console.log(data);
