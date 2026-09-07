import { SiteHeader } from "@/components/layout/SiteHeader";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { fetchReports } from "@/lib/api";

export default async function DashboardPage() {
  const reports = await fetchReports();

  return (
    <div className="min-h-dvh overflow-hidden bg-[#ffffff]">
      <SiteHeader compact />
      <DashboardClient reports={reports} />
    </div>
  );
}
