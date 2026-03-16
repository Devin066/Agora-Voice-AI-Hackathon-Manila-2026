import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRoute, navigate } from "../lib/router";

export function NavBar() {
  const route = useRoute();
  const supportAgents = useQuery(api.supportAgents.listAgents, {});

  const activeClass =
    "bg-[#2a6de1] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
  const inactiveClass =
    "bg-white text-black border-2 border-black hover:bg-slate-50";

  return (
    <nav className="flex flex-wrap gap-3 rounded-md border-2 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <button
        type="button"
        onClick={() => navigate("/")}
        className={`rounded-md px-4 py-2 text-sm font-bold uppercase tracking-widest transition-all ${
          route.view === "landing" ? activeClass : inactiveClass
        }`}
      >
        Call
      </button>
      <button
        type="button"
        onClick={() => navigate("/lead")}
        className={`rounded-md px-4 py-2 text-sm font-bold uppercase tracking-widest transition-all ${
          route.view === "lead" ? activeClass : inactiveClass
        }`}
      >
        Lead
      </button>
      {supportAgents?.map((agent) => (
        <button
          key={agent._id}
          type="button"
          onClick={() => navigate(`/agent/${agent.slug}`)}
          className={`rounded-md px-4 py-2 text-sm font-bold uppercase tracking-widest transition-all ${
            route.view === "agent" && route.slug === agent.slug
              ? activeClass
              : inactiveClass
          }`}
        >
          {agent.name}
        </button>
      ))}
    </nav>
  );
}
