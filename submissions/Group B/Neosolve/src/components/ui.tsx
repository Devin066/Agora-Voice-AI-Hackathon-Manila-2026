import type { DemoScenario } from "../demoScenarios";

// ── Shared UI components ─────────────────────────────────────────

export function SectionHeading(props: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1 border-b-2 border-black pb-3 mb-3">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-900 font-mono">
        {props.eyebrow}
      </p>
      <h2 className="text-2xl font-black tracking-tight text-black sm:text-3xl">
        {props.title}
      </h2>
      {props.description ? (
        <p className="text-sm font-medium text-slate-600">
          {props.description}
        </p>
      ) : null}
    </div>
  );
}

export function Panel(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 rounded-md border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="border-b-2 border-black pb-2">
        <h3 className="text-lg font-black text-black uppercase tracking-tight">
          {props.title}
        </h3>
      </div>
      <div className="grid gap-3">{props.children}</div>
    </div>
  );
}

export function StatCard(props: { label: string; value: number }) {
  return (
    <div className="rounded-md border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
        {props.label}
      </p>
      <p className="mt-1 text-2xl font-black text-black">{props.value}</p>
    </div>
  );
}

export function MetricPanel(props: {
  label: string;
  value: string;
  tone: "cyan" | "amber" | "rose";
}) {
  const toneClassNames = {
    cyan: "bg-[#2a6de1] text-white",
    amber: "bg-[#f5ce4d] text-black",
    rose: "bg-[#e03b24] text-white",
  } as const;

  return (
    <div
      className={`rounded-md border-2 border-black px-3 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${toneClassNames[props.tone]}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest font-mono">
        {props.label}
      </p>
      <p className="mt-1 text-2xl font-bold font-mono">{props.value}</p>
    </div>
  );
}

export function ActionButton(props: {
  children: React.ReactNode;
  onClick: () => void;
  busy?: boolean;
  tone?: "primary" | "secondary";
}) {
  const tone = props.tone ?? "primary";
  const className =
    tone === "primary"
      ? "bg-[#2a6de1] text-white active:bg-[#1a55b8]"
      : "bg-white text-slate-900 active:bg-slate-100";

  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.busy}
      className={`rounded-md border-2 border-black px-4 py-3 text-sm font-bold transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:translate-x-1 disabled:translate-y-1 disabled:shadow-none disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {props.busy ? "Working..." : props.children}
    </button>
  );
}

export function Tag(props: { children: React.ReactNode }) {
  return (
    <span className="rounded-sm border-2 border-black bg-[#f5ce4d] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black">
      {props.children}
    </span>
  );
}

export function DetailRow(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 rounded-sm border-2 border-black bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 font-mono">
        {props.label}
      </p>
      <p className="text-sm font-medium text-slate-900">{props.children}</p>
    </div>
  );
}

export function EmptyState(props: { message: string; dark?: boolean }) {
  return (
    <div
      className={[
        "rounded-md border-2 border-dashed px-4 py-6 text-sm font-bold font-mono text-center",
        props.dark
          ? "border-slate-500 bg-slate-900 text-slate-300"
          : "border-black bg-slate-100 text-slate-500",
      ].join(" ")}
    >
      {props.message}
    </div>
  );
}

// ── Utilities ────────────────────────────────────────────────────

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong while talking to the backend.";
}

export function humanizePriority(
  priority: DemoScenario["expectedPriority"],
): string {
  return humanizeToken(priority);
}

export function humanizeStatus(
  status: "open" | "in_progress" | "resolved",
): string {
  return humanizeToken(status);
}

export function humanizeToken(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}
