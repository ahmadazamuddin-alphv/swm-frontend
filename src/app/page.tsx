export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <p className="font-[family-name:var(--font-fraunces)] text-xl font-semibold tracking-tight text-selangor-red">
          Selangor Waste Management
        </p>
        <nav className="flex items-center gap-4 text-sm text-selangor-ink/80">
          <a className="hover:text-selangor-red" href="#dashboard">
            Dashboard
          </a>
          <a
            className="rounded-full bg-selangor-red px-4 py-2 text-primary-foreground transition hover:bg-selangor-red-deep"
            href="#report"
          >
            Report dumping
          </a>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-6 pb-20 pt-8">
        <div className="max-w-2xl space-y-5">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-selangor-red/80">
            Illegal Dumping POC
          </p>
          <h1 className="font-[family-name:var(--font-fraunces)] text-4xl leading-tight text-selangor-ink sm:text-5xl">
            Cleaner Selangor starts with every report.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-selangor-ink/75">
            Citizen dashboard and live-camera reporting for illegal dumping —
            map hotspots, track clearance, and connect cases to the right
            department.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              className="rounded-full bg-selangor-red px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-selangor-red-deep"
              href="#report"
            >
              Submit a report
            </a>
            <a
              className="rounded-full border border-selangor-red/25 bg-white/60 px-6 py-3 text-sm font-medium text-selangor-ink backdrop-blur transition hover:border-selangor-yellow hover:bg-selangor-yellow-soft/50"
              href="#dashboard"
            >
              View map dashboard
            </a>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Live camera reports",
              body: "Capture on-site photos only — no gallery uploads.",
            },
            {
              title: "AI waste ID",
              body: "Suggest waste type and responsible jabatan from the image and location.",
            },
            {
              title: "Solved visibility",
              body: "Show cleared cases so citizens see action and stay engaged.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-selangor-red/10 bg-white/55 p-5 shadow-[0_8px_30px_rgba(74,44,44,0.04)] backdrop-blur"
            >
              <h2 className="font-[family-name:var(--font-fraunces)] text-lg text-selangor-ink">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-selangor-ink/70">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
