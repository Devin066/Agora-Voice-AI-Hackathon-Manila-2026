import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Tag, EmptyState, humanizeToken, humanizeStatus } from "./ui";

export function AgentLane(props: {
  agentSlug: string;
  agentName: string;
  specialties: string[];
  activeCount: number;
  onSelectTicket: (ticketId: Id<"tickets">) => void;
  selectedTicketId: Id<"tickets"> | null;
}) {
  const dashboard = useQuery(api.tickets.agentDashboard, {
    agentSlug: props.agentSlug,
  });

  return (
    <div className="grid gap-4 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">
            {props.agentName}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {props.specialties
              .map((specialty) => humanizeToken(specialty))
              .join(" / ")}
          </p>
        </div>
        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
          {props.activeCount} active
        </span>
      </div>

      {dashboard && dashboard.tickets.length > 0 ? (
        dashboard.tickets.map((ticket) => {
          const isSelected = ticket._id === props.selectedTicketId;
          return (
            <button
              key={ticket._id}
              type="button"
              onClick={() => props.onSelectTicket(ticket._id)}
              className={[
                "grid gap-2 rounded-md border-2 px-4 py-3 text-left transition-all",
                isSelected
                  ? "border-black bg-[#f5ce4d] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]"
                  : "border-black bg-white shadow-none hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-950">
                  {ticket.customerName}
                </p>
                <Tag>{humanizeStatus(ticket.status)}</Tag>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                {ticket.summary}
              </p>
            </button>
          );
        })
      ) : (
        <EmptyState
          message={`No tickets assigned to ${props.agentName} yet.`}
        />
      )}
    </div>
  );
}
