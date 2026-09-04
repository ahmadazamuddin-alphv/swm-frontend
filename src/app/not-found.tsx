import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 pb-20 text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-obsidian">
          Report not found
        </h1>
        <p className="mt-3 text-steel">
          That case ID is not in the demo dataset.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex justify-center rounded-[14px] border border-[#2c2e34] bg-obsidian px-5 py-3 text-sm font-medium text-snow"
        >
          Back to dashboard
        </Link>
      </main>
    </div>
  );
}
