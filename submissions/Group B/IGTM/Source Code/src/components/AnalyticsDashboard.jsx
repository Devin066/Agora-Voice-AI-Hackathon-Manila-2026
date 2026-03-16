function AnalyticsDashboard({ analyticsData }) {
  if (!analyticsData) return null
  return (
    <div className="rounded-xl border border-white/20 bg-black/20 p-4">
      <h3 className="text-lg font-semibold text-white">Session Analytics</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-white/10 p-3">
          <p className="text-xs text-slate-300">Score</p>
          <p className="text-2xl font-bold text-success">{analyticsData.score}</p>
        </div>
        <div className="rounded-lg bg-white/10 p-3">
          <p className="text-xs text-slate-300">Duration</p>
          <p className="text-2xl font-bold text-white">{analyticsData.duration}</p>
        </div>
        <div className="rounded-lg bg-white/10 p-3">
          <p className="text-xs text-slate-300">Turns</p>
          <p className="text-2xl font-bold text-white">{analyticsData.totalTurns}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {analyticsData.highlights.map((item) => (
          <p key={item} className="rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-100">
            {item}
          </p>
        ))}
      </div>
      {analyticsData.feedbackSummary ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg bg-white/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">AI Feedback</p>
            <p className="mt-2 text-sm text-slate-100">{analyticsData.feedbackSummary}</p>
          </div>
          {analyticsData.strengths?.length ? (
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Strengths</p>
              <ul className="mt-2 space-y-1">
                {analyticsData.strengths.map((item) => (
                  <li key={`strength-${item}`} className="text-sm text-slate-100">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {analyticsData.tips?.length ? (
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Tips</p>
              <ul className="mt-2 space-y-1">
                {analyticsData.tips.map((item) => (
                  <li key={`tip-${item}`} className="text-sm text-slate-100">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {analyticsData.keynotes?.length ? (
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Keynotes</p>
              <ul className="mt-2 space-y-1">
                {analyticsData.keynotes.map((item) => (
                  <li key={`keynote-${item}`} className="text-sm text-slate-100">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default AnalyticsDashboard
