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
      <div className="rounded-[14px] border border-dashed border-[#d4d4d8] bg-[#ffffff]/80 p-6 text-sm leading-relaxed text-[#6e5c4b] shadow-[0_14px_34px_rgba(9,9,11,0.06)]">
        Location is needed before the responsible department can be suggested.
      </div>
    );
  }

  return (
    <section
      className={`rounded-[14px] border bg-[#ffffff]/95 p-6 shadow-[0_16px_38px_rgba(9,9,11,0.08)] ${
        highlight ? "border-[#D2222B]" : "border-[#e4e4e7]"
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
        <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-[7px] border border-[#e4e4e7] bg-white p-1 shadow-[0_8px_16px_rgba(9,9,11,0.10)]">
          {party.logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={party.logoUrl} alt={`${party.department} logo`} className="max-h-full max-w-full object-contain" />
          ) : (
            <BuildingsIcon className="size-5 text-[#D2222B]" />
          )}
        </span>
      </div>

      {highlight && (
        <span className="mt-4 inline-flex rounded-xl bg-[#FDB915] px-2.5 py-1 text-[11px] font-semibold text-[#4a1b0d]">
          Suggested for this location
        </span>
      )}

      <dl className="mt-5 divide-y divide-[#e4e4e7] text-sm">
        <div className="grid grid-cols-[90px_1fr] gap-4 py-2.5">
          <dt className="text-fog">Contractor</dt>
          <dd className="text-right text-[#3a281b]">{party.contractor}</dd>
        </div>
        <div className="grid grid-cols-[90px_1fr] gap-4 py-2.5">
          <dt className="text-fog">Contact</dt>
          <dd className="text-right text-[#3a281b]">{party.contactPerson}</dd>
        </div>
        <div className="grid grid-cols-[90px_1fr] gap-4 py-2.5">
          <dt className="text-fog">Phone</dt>
          <dd className="text-right">
            <a
              href={`tel:${party.phone}`}
              className="text-[#3a281b] underline decoration-[#d4d4d8] underline-offset-4 hover:text-[#a91824]"
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
              className="break-all text-[#3a281b] underline decoration-[#d4d4d8] underline-offset-4 hover:text-[#a91824]"
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
                className="rounded-xl border border-[#e4e4e7] bg-white/60 px-2 py-1 text-xs text-[#3a281b]"
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
