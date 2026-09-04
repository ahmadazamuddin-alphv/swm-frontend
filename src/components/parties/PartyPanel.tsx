import { BuildingsIcon } from "@/components/ui/Icons";
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
      <div className="rounded-[36px] border border-dashed border-mist bg-snow p-6 text-sm leading-relaxed text-fog">
        Location is needed before the responsible department can be suggested.
      </div>
    );
  }

  return (
    <section
      className={`rounded-[36px] border bg-snow p-6 ${
        highlight ? "border-mist" : "border-cloud"
      }`}
      aria-labelledby={`party-${party.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-fog">Responsible party</p>
          <h2
            id={`party-${party.id}`}
            className="mt-2 text-lg font-semibold leading-snug text-obsidian"
          >
            {party.department}
          </h2>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-obsidian text-snow">
          <BuildingsIcon className="size-5" />
        </span>
      </div>

      {highlight && (
        <span className="mt-4 inline-flex rounded-xl bg-ember px-2.5 py-1 text-[11px] font-medium text-snow">
          Suggested for this location
        </span>
      )}

      <dl className="mt-5 divide-y divide-cloud text-sm">
        <div className="grid grid-cols-[90px_1fr] gap-4 py-2.5">
          <dt className="text-fog">Contractor</dt>
          <dd className="text-right text-graphite">{party.contractor}</dd>
        </div>
        <div className="grid grid-cols-[90px_1fr] gap-4 py-2.5">
          <dt className="text-fog">Contact</dt>
          <dd className="text-right text-graphite">{party.contactPerson}</dd>
        </div>
        <div className="grid grid-cols-[90px_1fr] gap-4 py-2.5">
          <dt className="text-fog">Phone</dt>
          <dd className="text-right">
            <a
              href={`tel:${party.phone}`}
              className="text-graphite underline decoration-mist underline-offset-4 hover:text-ember"
            >
              {party.phone}
            </a>
          </dd>
        </div>
        <div className="grid grid-cols-[90px_1fr] gap-4 py-2.5">
          <dt className="text-fog">Email</dt>
          <dd className="min-w-0 text-right">
            <a
              href={`mailto:${party.email}`}
              className="break-all text-graphite underline decoration-mist underline-offset-4 hover:text-ember"
            >
              {party.email}
            </a>
          </dd>
        </div>
        <div className="py-2.5">
          <dt className="text-fog">Zone coverage</dt>
          <dd className="mt-2 flex flex-wrap gap-1.5">
            {party.zoneCoverage.map((zone) => (
              <span
                key={zone}
                className="rounded-xl border border-cloud px-2 py-1 text-xs text-graphite"
              >
                {zone}
              </span>
            ))}
          </dd>
        </div>
      </dl>
    </section>
  );
}
