import { SiteHeader } from "@/components/layout/SiteHeader";
import { ReportWizard } from "@/components/reporting/ReportWizard";

export default function ReportPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16 pt-4 sm:px-8">
        <ReportWizard />
      </main>
    </div>
  );
}
