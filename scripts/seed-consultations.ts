import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey)
  throw new Error("Missing Supabase environment variables");

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seed() {
  const {
    data: { users },
    error: usersError,
  } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (usersError) throw usersError;

  const student = users.find((user) => user.email === "student@example.com");
  const admin = users.find((user) => user.email === "admin@example.com");

  if (!student || !admin)
    throw new Error("Seed users not found. Run `npm run seed:users` first.");

  // Make the script safe to run multiple times.
  const { error: deleteError } = await supabase
    .from("consultations")
    .delete()
    .in("user_id", [student.id, admin.id]);

  if (deleteError) throw deleteError;

  const consultations = [
    {
      user_id: student.id,
      first_name: "Test",
      last_name: "Student",
      reason: "Review upcoming assessment requirements",
      consultation_at: "2026-08-18T10:00:00+10:00",
    },
    {
      user_id: student.id,
      first_name: "Test",
      last_name: "Student",
      reason: "Discuss study plan and time management",
      consultation_at: "2026-08-21T14:30:00+10:00",
    },
    {
      user_id: student.id,
      first_name: "Test",
      last_name: "Student",
      reason: "Clarify feedback from recent coursework",
      consultation_at: "2026-08-25T11:00:00+10:00",
    },
    {
      user_id: student.id,
      first_name: "Test",
      last_name: "Student",
      reason: "Review consultation scheduling workflow",
      consultation_at: "2026-08-20T09:30:00+10:00",
    },
  ];

  const { error: insertError } = await supabase
    .from("consultations")
    .insert(consultations);

  if (insertError) throw insertError;

  console.log(`Seeded ${consultations.length} consultations.`);
}

seed()
  .then(() => {
    console.log("Consultations seeded.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed consultations:", error);
    process.exit(1);
  });
