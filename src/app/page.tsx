import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ArrowRightIcon, MapPinIcon } from "@/components/ui/Icons";
import { ImpactGallery } from "@/components/home/ImpactGallery";

const facts = [
  { value: "10", label: "illustrative cases" },
  { value: "4", label: "local councils" },
  { value: "7", label: "waste categories" },
];

const journey = [
  {
    title: "See the pattern",
    body: "Explore changing hotspots, active cases and cleared sites in one spatial view.",
  },
  {
    title: "Capture it live",
    body: "Use the on-site camera and GPS so each report begins with useful evidence.",
  },
  {
    title: "Know who responds",
    body: "See the department, contractor and contact responsible for the selected zone.",
  },
];

export default function HomePage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#f8f1e5]">
      <SiteHeader />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-[position:48%_center] opacity-45 sm:bg-center"
          style={{ backgroundImage: "url('/brand/selangor-mosque.jpg')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,241,229,0.93)_0%,rgba(248,241,229,0.72)_38%,#f8f1e5_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_10%,rgba(253,185,21,0.22),transparent_48%),radial-gradient(ellipse_at_90%_18%,rgba(210,34,43,0.14),transparent_48%)]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-5 pb-8 pt-28 sm:px-8 sm:pb-12 sm:pt-32">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#a91824]">Siaga Selangor · Civic signal platform</p>
        <section className="grid flex-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-6">
          <div className="flex flex-col justify-between lg:col-span-7 lg:py-5">
            <div>
              <h1 className="text-balance max-w-[760px] text-[clamp(3rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-obsidian">
                Cleaner streets begin when everyone can see the signal.
              </h1>
              <p className="mt-7 max-w-[62ch] text-base leading-relaxed text-steel sm:text-lg">
                Siaga Selangor turns a resident’s observation into a shared,
                traceable signal—one that can be located, routed and followed
                through to action.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 lg:mt-14">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-[14px] border border-[#2c2e34] bg-obsidian px-5 py-3 text-sm font-medium text-snow shadow-[inset_0_0.5px_0_rgba(255,255,255,0.5),inset_0_9px_14px_-5px_rgba(117,123,133,0.4),0_4px_6px_rgba(0,0,0,0.14)] hover:-translate-y-0.5"
              >
                Open 3D activity map
                <ArrowRightIcon className="size-4" />
              </Link>
              <Link
                href="/report"
                className="inline-flex items-center rounded-[14px] border border-cloud bg-snow px-5 py-3 text-sm font-medium text-iron hover:border-mist hover:text-obsidian"
              >
                Make a report
              </Link>
            </div>
            <p className="mt-5 inline-flex items-center gap-2 text-xs text-fog">
              <span className="size-1.5 rounded-[3px] bg-ember" />
              Illustrative citizen POC · no live service connection
            </p>
          </div>

          <article className="overflow-hidden rounded-[32px] border border-[#ead9b8] bg-[#fff8ea]/95 shadow-[0_18px_42px_rgba(64,35,10,0.10)] lg:col-span-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mock/reports/construction-1.jpg"
              alt="Illegal construction waste at a roadside in Selangor"
              className="h-[320px] w-full object-cover lg:h-[calc(100%-168px)] lg:min-h-[420px]"
            />
            <div className="flex min-h-[168px] items-end justify-between gap-6 p-7">
              <div>
                <p className="text-xl font-semibold text-obsidian">
                  Evidence becomes action.
                </p>
                <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-fog">
                  Every point connects a place, waste type and responsible
                  council.
                </p>
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-ember text-snow">
                <MapPinIcon className="size-5" />
              </span>
            </div>
          </article>
        </section>

        <ImpactGallery />

        <section className="mt-8 grid overflow-hidden rounded-[32px] border border-[#ead9b8] bg-[#fff8ea]/95 shadow-[0_18px_42px_rgba(64,35,10,0.10)] lg:mt-12 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="bg-graphite p-7 text-snow sm:p-10">
            <h2 className="max-w-[15ch] text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
              From street evidence to accountable action.
            </h2>
            <div className="mt-10 divide-y divide-iron">
              {journey.map(({ title, body }) => (
                <article
                  key={title}
                  className="grid gap-3 py-5 sm:grid-cols-[180px_1fr_auto] sm:items-start"
                >
                  <h3 className="text-base font-semibold text-snow">{title}</h3>
                  <p className="max-w-[46ch] text-sm leading-relaxed text-ash">
                    {body}
                  </p>
                  <ArrowRightIcon className="hidden size-4 text-ember sm:block" />
                </article>
              ))}
            </div>
          </div>

          <aside className="border-t border-cloud p-7 lg:border-l lg:border-t-0 lg:p-9">
            <p className="text-sm font-medium text-iron">POC coverage</p>
            <dl className="mt-7 divide-y divide-cloud border-y border-cloud">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-baseline justify-between gap-5 py-5"
                >
                  <dt className="text-sm text-fog">{fact.label}</dt>
                  <dd className="tabular-nums text-4xl font-semibold tracking-[-0.03em] text-obsidian">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 max-w-[30ch] text-xs leading-relaxed text-ash">
              Coverage figures describe the current hardcoded demonstration
              dataset.
            </p>
          </aside>
        </section>
      </main>
    </div>
  );
}
