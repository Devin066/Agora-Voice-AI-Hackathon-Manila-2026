"use client";

import * as React from "react";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "ghost" },
) {
  const { className, variant = "solid", ...rest } = props;
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "solid"
          ? "bg-white text-black hover:bg-zinc-200"
          : "bg-white/0 text-white hover:bg-white/10",
        className,
      )}
    />
  );
}

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string },
) {
  const { className, label, ...rest } = props;
  return (
    <label className="block">
      {label ? <div className="mb-1 text-xs text-zinc-300">{label}</div> : null}
      <input
        {...rest}
        className={cx(
          "h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-white/25",
          className,
        )}
      />
    </label>
  );
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string },
) {
  const { className, label, children, ...rest } = props;
  return (
    <label className="block">
      {label ? <div className="mb-1 text-xs text-zinc-300">{label}</div> : null}
      <select
        {...rest}
        className={cx(
          "h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition focus:border-white/25",
          className,
        )}
      >
        {children}
      </select>
    </label>
  );
}

export function Badge(props: { children: React.ReactNode; tone?: "neutral" | "ok" | "warn" | "bad" }) {
  const tone = props.tone ?? "neutral";
  const cls =
    tone === "ok"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
      : tone === "warn"
        ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
        : tone === "bad"
          ? "border-rose-400/30 bg-rose-400/10 text-rose-200"
          : "border-white/15 bg-white/5 text-zinc-200";
  return <span className={cx("inline-flex rounded-full border px-2 py-1 text-xs", cls)}>{props.children}</span>;
}

