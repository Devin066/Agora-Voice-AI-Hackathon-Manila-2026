import UrgencyBadge from "./components/UrgencyBadge";

const urgencyWeight = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

function DoctorDashboard({ queue }) {
  const sortedQueue = [...queue].sort((a, b) => {
    const urgencyDiff = (urgencyWeight[b.urgency] || 0) - (urgencyWeight[a.urgency] || 0);
    if (urgencyDiff !== 0) return urgencyDiff;
    return b.createdAt - a.createdAt;
  });

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm">
        <h2 className="font-headline text-2xl font-bold text-slate-900">Doctor Queue</h2>
        <p className="text-slate-600">Patients sorted by urgency for fast triage handoff.</p>
      </div>

      <div className="space-y-3">
        {sortedQueue.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-slate-500">
            No patients yet. Start a triage session from the patient page.
          </div>
        ) : (
          sortedQueue.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-3">
                <UrgencyBadge urgency={item.urgency} />
                <span className="text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="font-semibold text-slate-900">{item.summary}</p>
              <p className="mt-1 text-sm text-slate-600">Possible issue: {item.possible_issue}</p>
              <p className="mt-1 text-sm text-slate-700">Recommendation: {item.recommendation}</p>
              {item.follow_up_question && item.follow_up_answer && (
                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Follow-up Context</p>
                  <p className="mt-1 text-sm text-slate-700">
                    <span className="font-semibold">Question:</span> {item.follow_up_question}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    <span className="font-semibold">Answer:</span> {item.follow_up_answer}
                  </p>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default DoctorDashboard;
