import { SiteHeader } from "@/components/layout/SiteHeader";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { fetchReports } from "@/lib/api";

export default async function DashboardPage() {
  const reports = await fetchReports();

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <SiteHeader compact />
      <DashboardClient reports={reports} />
    </div>
  );
}
