import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type UseCaseCardProps = {
  label: string;
  href: string;
  index?: number;
};

export function UseCaseCard({ label, href, index }: UseCaseCardProps) {
  const num = index !== undefined ? String(index + 1).padStart(2, "0") : null;

  return (
    <Link
      href={href}
      className="group relative flex min-h-56 flex-col overflow-hidden rounded-xl bg-white px-7 py-7 shadow-[0_12px_30px_rgba(24,59,86,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_40px_rgba(24,59,86,0.16)]"
    >
      {/* Top accent bar — slides in from left on hover */}
      <span className="absolute left-0 top-0 h-1 w-full origin-left bg-gradient-to-r from-[#E2B34B] via-[#D95C50] to-[#5C9EAD] transition-transform duration-300 group-hover:scale-x-100" />
      {/* Left accent bar */}
      <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#1C4E78] to-[#5C9EAD]" />

      <div className="flex items-start justify-between">
        {num !== null ? (
          <span className="text-xs font-bold tabular-nums tracking-[0.18em] text-[#1C4E78]/50">
            {num}
          </span>
        ) : (
          <span className="rounded-full bg-[#EEF2F5] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]">
            Opportunity
          </span>
        )}
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#E2B34B] bg-[#FFF8E8] text-[#1C4E78] transition duration-300 group-hover:border-[#1C4E78] group-hover:bg-[#1C4E78] group-hover:text-white">
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>

      <span className="mt-auto block text-2xl font-semibold leading-snug text-[#183B56]">
        {label}
      </span>
      <span className="mt-2 block text-sm text-[#1C4E78]/70">
        Start a guided training scenario
      </span>
    </Link>
  );
}
