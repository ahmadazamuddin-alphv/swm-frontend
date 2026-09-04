import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function HomePage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_70%_20%,rgba(196,92,92,0.28),transparent_55%),radial-gradient(ellipse_60%_50%_at_15%_80%,rgba(232,197,71,0.25),transparent_50%),linear-gradient(165deg,#FFF8F2_0%,#F5E6DC_45%,#E8D0C8_100%)]" />
        <div className="hero-drift absolute inset-x-0 top-[28%] h-[55vh] opacity-40 sm:inset-x-auto sm:-right-[8%] sm:top-[4%] sm:h-[82vh] sm:w-[70vw] sm:max-w-5xl sm:opacity-95 sm:[mask-image:linear-gradient(100deg,transparent_0%,black_14%,black_100%)]">
          <div className="h-full w-full bg-[url('/hero-selangor.svg')] bg-cover bg-center sm:bg-[center_right]" />
        </div>
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-selangor-cream/20 via-transparent to-transparent" />
      </div>

      <SiteHeader />

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pb-20 pt-6 sm:px-8 sm:pb-28 sm:pt-10">
        <div className="hero-rise max-w-xl space-y-6">
          <p className="font-[family-name:var(--font-fraunces)] text-4xl font-semibold leading-none tracking-tight text-selangor-red sm:text-5xl md:text-6xl">
            Selangor Waste Management
          </p>
          <h1 className="max-w-md font-[family-name:var(--font-fraunces)] text-2xl leading-snug text-selangor-ink sm:text-3xl">
            Spot illegal dumping. Report it live. Watch it get cleared.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-selangor-ink/75 sm:text-lg">
            A citizen map of changing hotspots — with live-camera tips and the
            jabatan responsible for each zone.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/report"
              className="cta-pulse rounded-md bg-selangor-red px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-selangor-red-deep"
            >
              Report dumping
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md border border-selangor-red/25 bg-white/55 px-6 py-3 text-sm font-medium text-selangor-ink backdrop-blur transition hover:border-selangor-yellow hover:bg-selangor-yellow-soft/40"
            >
              View dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
