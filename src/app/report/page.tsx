import { SiteHeader } from "@/components/layout/SiteHeader";
import { ReportWizard } from "@/components/reporting/ReportWizard";

export default function ReportPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#f8f1e5]">
      <SiteHeader />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-[position:48%_center] sm:bg-center"
          style={{ backgroundImage: "url('/brand/selangor-mosque.jpg')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,241,229,0.90)_0%,rgba(248,241,229,0.65)_30%,rgba(248,241,229,0.56)_58%,#f8f1e5_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_8%_10%,rgba(253,185,21,0.24),transparent_50%),radial-gradient(ellipse_at_90%_22%,rgba(210,34,43,0.14),transparent_52%)]" />
      </div>
      <main className="relative z-10 mx-auto w-full max-w-[1200px] flex-1 px-5 pb-12 pt-28 sm:px-8 sm:pb-16 sm:pt-32">
        <ReportWizard />
      </main>
    </div>
  );
}
