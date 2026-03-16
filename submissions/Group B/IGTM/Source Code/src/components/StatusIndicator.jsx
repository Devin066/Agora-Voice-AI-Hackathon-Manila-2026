function StatusIndicator({ active, listening, speaking, thinking, mode }) {
  const statusLabel = thinking
    ? 'AI Thinking'
    : speaking
      ? 'AI Speaking'
      : listening
        ? 'Listening'
        : active
          ? 'Ready'
          : 'Idle'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
        {statusLabel}
      </span>
      <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
        {mode}
      </span>
    </div>
  )
}

export default StatusIndicator
