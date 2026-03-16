import { Link, Route, Routes } from "react-router-dom";
import { useMemo, useState } from "react";
import PatientTriage from "./PatientTriage";
import DoctorDashboard from "./DoctorDashboard";
import lingappLogo from "../img/lingapp_Budokan_Rounded.png";

function App() {
  const [queue, setQueue] = useState([]);

  const addCaseToQueue = (caseData) => {
    setQueue((prev) => [{ id: crypto.randomUUID(), createdAt: Date.now(), ...caseData }, ...prev]);
  };

  const queueCountByUrgency = useMemo(() => {
    return queue.reduce(
      (acc, item) => {
        const key = item.urgency?.toUpperCase() || "LOW";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { LOW: 0, MEDIUM: 0, HIGH: 0 }
    );
  }, [queue]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 md:px-8">
      <header className="mb-6 rounded-3xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={lingappLogo}
              alt="Lingapp logo"
              className="h-14 w-auto rounded-xl border border-slate-200 bg-white p-1 md:h-16"
            />
            <div>
            <h1 className="font-headline text-2xl font-bold text-slate-900 md:text-3xl">
              Voice AI Medical Triage
            </h1>
            <p className="text-sm text-slate-600">Hackathon MVP using Agora + LLM analysis</p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              to="/"
            >
              Patient Triage
            </Link>
            <Link
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              to="/doctor"
            >
              Doctor Queue
            </Link>
          </nav>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="rounded-lg bg-red-100 px-3 py-1 font-semibold text-red-700">HIGH: {queueCountByUrgency.HIGH}</span>
          <span className="rounded-lg bg-orange-100 px-3 py-1 font-semibold text-orange-700">
            MEDIUM: {queueCountByUrgency.MEDIUM}
          </span>
          <span className="rounded-lg bg-green-100 px-3 py-1 font-semibold text-green-700">LOW: {queueCountByUrgency.LOW}</span>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<PatientTriage onNewCase={addCaseToQueue} />} />
        <Route path="/doctor" element={<DoctorDashboard queue={queue} />} />
      </Routes>
    </div>
  );
}

export default App;
