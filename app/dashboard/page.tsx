import { redirect } from "next/navigation";

import Dashboard from "@/components/dashboard/client-dashboard";
import { Suspense } from "react";
import consultationService from "@/lib/supabase/consultations/service";
import { getAuthenticatedUser, isAdmin } from "@/lib/auth/authenticate";
import Spinner from "@/components/ui/spinner";

export default async function DashboardPage() {
  return (
    <div className="flex-1 w-11/12 flex flex-col gap-12">
      <div>
        <h2 className="font-bold text-2xl mb-4">Dashboard</h2>
        <Suspense fallback={<Spinner />}>
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}

const DashboardContent = async () => {
  const user = await getAuthenticatedUser();
  if (!user) return redirect("/auth/login");

  const consultations = await consultationService.fetchForUser(user);

  return <Dashboard consultations={consultations} isAdmin={isAdmin(user)} />;
};
