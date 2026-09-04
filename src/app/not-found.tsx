import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 pb-20 text-center">
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-selangor-ink">
          Report not found
        </h1>
        <p className="mt-3 text-selangor-ink/70">
          That case ID is not in the demo dataset.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex justify-center rounded-md bg-selangor-red px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-selangor-red-deep"
        >
          Back to dashboard
        </Link>
      </main>
    </div>
  );
}
