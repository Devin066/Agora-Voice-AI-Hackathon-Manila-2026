import { useEffect } from "react";
import { useRoute } from "./lib/router";
import { NavBar } from "./components/NavBar";
import { LandingPage } from "./views/LandingPage";
import { LeadDashboard } from "./views/LeadDashboard";
import { AgentView } from "./views/AgentView";

const PAGE_TITLES: Record<string, string> = {
  landing: "Neosolve — Voice AI Support",
  lead: "Team Lead Dashboard — Neosolve",
  agent: "Agent Dashboard — Neosolve",
};

export default function App() {
  const route = useRoute();

  useEffect(() => {
    document.title = PAGE_TITLES[route.view] ?? "Neosolve";
  }, [route.view]);

  return (
    <div className="min-h-screen px-4 py-4 text-slate-950 sm:px-5 lg:px-6">
      <div className="flex w-full flex-col gap-4">
        <NavBar />
        {route.view === "landing" && <LandingPage />}
        {route.view === "lead" && <LeadDashboard />}
        {route.view === "agent" && <AgentView slug={route.slug} />}
      </div>
    </div>
  );
}
