import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const seedUsers = [
  {
    email: "student@example.com",
    password: "Student123!",
    userMetadata: {
      firstName: "Test",
      lastName: "Student",
    },
    appMetadata: {},
  },
  {
    email: "admin@example.com",
    password: "Admin123!",
    userMetadata: {
      firstName: "Test",
      lastName: "Admin",
    },
    appMetadata: {
      role: "admin",
    },
  },
];

async function seed() {
  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) throw listError;

  for (const seedUser of seedUsers) {
    const existingUser = users.find((user) => user.email === seedUser.email);

    if (existingUser) {
      const { error } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: seedUser.password,
          email_confirm: true,
          user_metadata: seedUser.userMetadata,
          app_metadata: {
            ...existingUser.app_metadata,
            ...seedUser.appMetadata,
          },
        },
      );

      if (error) {
        throw error;
      }

      console.log(`Updated ${seedUser.email}`);
      continue;
    }

    const { error } = await supabase.auth.admin.createUser({
      email: seedUser.email,
      password: seedUser.password,
      email_confirm: true,
      user_metadata: seedUser.userMetadata,
      app_metadata: seedUser.appMetadata,
    });

    if (error) throw error;

    console.log(`Created ${seedUser.email}`);
  }
}

seed()
  .then(() => {
    console.log("Auth users seeded.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed auth users:", error);
    process.exit(1);
  });
