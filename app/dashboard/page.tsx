import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { InfoIcon, Loader } from "lucide-react";
import Dashboard from "@/components/dashboard/client-dashboard";
import { Suspense } from "react";

async function fetchUserDetails() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) redirect("/auth/login");

  return data.claims;
}

export default async function DashboardPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div>
        <h2 className="font-bold text-2xl mb-4">Dashboard</h2>
        <Suspense fallback={<div>Loading Dashboard...</div>}>
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}

const DashboardContent = async () => {
  const userDetails = await fetchUserDetails();
  return <Dashboard user={userDetails} />;
};
