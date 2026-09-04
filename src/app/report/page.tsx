import { SiteHeader } from "@/components/layout/SiteHeader";
import { ReportWizard } from "@/components/reporting/ReportWizard";

export default function ReportPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-12">
        <ReportWizard />
      </main>
    </div>
  );
}
