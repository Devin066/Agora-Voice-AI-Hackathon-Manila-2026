import { Lightbulb } from "lucide-react";

type SuggestionPanelProps = {
  suggestion: string;
};

export function SuggestionPanel({ suggestion }: SuggestionPanelProps) {
  return (
    <section className="flex gap-5 rounded-xl bg-yellow-100 p-7 shadow-[0_12px_30px_rgba(24,59,86,0.08)]">
      <div className="mt-0.5 shrink-0">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E2B34B]/20 text-[#E2B34B]">
          <Lightbulb className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
      <div className="min-w-0">
        <span className="inline-flex rounded-full bg-[#E2B34B]/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]">
          Suggestion
        </span>
        <p className="mt-3 text-lg leading-relaxed text-[#183B56]">{suggestion}</p>
      </div>
    </section>
  );
}
