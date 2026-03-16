type ScenarioPanelProps = {
  scenario: string;
};

export function ScenarioPanel({ scenario }: ScenarioPanelProps) {
  return (
    <section className="relative overflow-hidden rounded-xl bg-white p-7 shadow-[0_12px_30px_rgba(24,59,86,0.08)]">
      <span className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-[#5C9EAD] to-[#1C4E78]" />
      <span className="inline-flex rounded-full bg-[#EEF2F5] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#1C4E78]">
        Scenario
      </span>
      <h2 className="mt-4 text-2xl font-bold text-[#183B56]">{scenario}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#1C4E78]/70">
        Communicate with confidence using concise, structured responses.
      </p>
    </section>
  );
}
