import type { ResponsibleParty } from "@/lib/types";

export function PartyPanel({
  party,
  highlight,
}: {
  party: ResponsibleParty | null;
  highlight?: boolean;
}) {
  if (!party) {
    return (
      <div className="rounded-lg border border-dashed border-selangor-red/20 bg-white/40 p-5 text-sm text-selangor-ink/60">
        Select a report or area to see the responsible department, contractor,
        and contacts.
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border p-5 transition ${
        highlight
          ? "border-selangor-yellow bg-selangor-yellow-soft/50"
          : "border-selangor-red/10 bg-white/55"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-selangor-red/80">
        Responsible party
      </p>
      <h3 className="mt-2 font-[family-name:var(--font-fraunces)] text-lg leading-snug text-selangor-ink">
        {party.department}
      </h3>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-selangor-ink/55">Contractor</dt>
          <dd className="text-right text-selangor-ink">{party.contractor}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-selangor-ink/55">Contact</dt>
          <dd className="text-right text-selangor-ink">{party.contactPerson}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-selangor-ink/55">Phone</dt>
          <dd className="text-right text-selangor-ink">
            <a href={`tel:${party.phone}`} className="hover:text-selangor-red">
              {party.phone}
            </a>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-selangor-ink/55">Email</dt>
          <dd className="text-right text-selangor-ink">
            <a
              href={`mailto:${party.email}`}
              className="hover:text-selangor-red"
            >
              {party.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-selangor-ink/55">Zone coverage</dt>
          <dd className="mt-1 text-selangor-ink">
            {party.zoneCoverage.join(" · ")}
          </dd>
        </div>
      </dl>
    </div>
  );
}
