import type { Id } from "../../convex/_generated/dataModel";
import {
  Tag,
  EmptyState,
  humanizeToken,
  humanizePriority,
  formatTimestamp,
} from "./ui";

type TicketSummary = {
  _id: Id<"tickets">;
  customerName: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  summary: string;
  createdAt: number;
  assignedAgentName?: string | null;
};

export function TicketQueue(props: {
  tickets: TicketSummary[];
  selectedTicketId: Id<"tickets"> | null;
  onSelectTicket: (ticketId: Id<"tickets">) => void;
}) {
  if (props.tickets.length === 0) {
    return <EmptyState message="No tickets yet." />;
  }

  const priorityBorder: Record<string, string> = {
    urgent: "border-l-red-500",
    high: "border-l-orange-500",
    medium: "border-l-yellow-500",
    low: "border-l-slate-400",
  };

  return (
    <>
      {props.tickets.map((ticket) => {
        const isSelected = ticket._id === props.selectedTicketId;
        return (
          <button
            key={ticket._id}
            type="button"
            onClick={() => props.onSelectTicket(ticket._id)}
            className={[
              "grid gap-2 rounded-md border-2 border-l-4 px-4 py-3 text-left transition-all",
              priorityBorder[ticket.priority] ?? "border-l-slate-400",
              isSelected
                ? "border-black bg-[#f5ce4d] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]"
                : "border-black bg-white hover:bg-slate-50 shadow-none hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
            ].join(" ")}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-base font-semibold text-slate-950">
                  {ticket.customerName}
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                  <Tag>{humanizeToken(ticket.category)}</Tag>
                  <Tag>{humanizePriority(ticket.priority)}</Tag>
                </div>
              </div>
              <span className="text-sm text-slate-500">
                {formatTimestamp(ticket.createdAt)}
              </span>
            </div>
            <p className="text-sm leading-6 text-slate-600">{ticket.summary}</p>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              {ticket.assignedAgentName
                ? `Assigned to ${ticket.assignedAgentName}`
                : "Waiting for assignment"}
            </p>
          </button>
        );
      })}
    </>
  );
}
