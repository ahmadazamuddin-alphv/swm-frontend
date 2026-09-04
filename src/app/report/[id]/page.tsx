import { SiteHeader } from "@/components/layout/SiteHeader";
import { ReportDetailClient } from "@/components/reports/ReportDetailClient";
import { fetchReport } from "@/lib/api";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await fetchReport(id);

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <SiteHeader />
      <ReportDetailClient id={id} initialReport={report} />
    </div>
  );
}
