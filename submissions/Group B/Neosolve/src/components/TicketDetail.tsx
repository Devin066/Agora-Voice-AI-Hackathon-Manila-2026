import type { Id } from "../../convex/_generated/dataModel";
import {
  Tag,
  DetailRow,
  EmptyState,
  ActionButton,
  humanizeToken,
  humanizePriority,
  humanizeStatus,
  formatTimestamp,
} from "./ui";

type TicketData = {
  ticket: {
    _id: Id<"tickets">;
    customerName: string;
    customerPhone?: string;
    category: string;
    priority: "low" | "medium" | "high" | "urgent";
    status: "open" | "in_progress" | "resolved";
    assignmentReason: string;
    summary: string;
    startedAt: number;
    endedAt: number;
    transcript: Array<{ role: string; content: string }>;
  };
};

export function TicketDetail(props: {
  selectedTicket: TicketData | null | undefined;
  onStatusChange: (
    ticketId: Id<"tickets">,
    status: "open" | "in_progress" | "resolved",
  ) => void;
  pendingAction: string | null;
}) {
  const { selectedTicket } = props;

  if (selectedTicket === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-500 animate-pulse">
          Loading ticket...
        </p>
      </div>
    );
  }

  if (!selectedTicket) {
    return <EmptyState message="Select a ticket to view details." />;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="grid gap-3 rounded-md border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-slate-500">
              Customer
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              {selectedTicket.ticket.customerName}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag>{humanizeToken(selectedTicket.ticket.category)}</Tag>
            <Tag>{humanizePriority(selectedTicket.ticket.priority)}</Tag>
          </div>
        </div>

        <DetailRow label="Assignment">
          {selectedTicket.ticket.assignmentReason}
        </DetailRow>
        <DetailRow label="Summary">{selectedTicket.ticket.summary}</DetailRow>
        {selectedTicket.ticket.customerPhone ? (
          <DetailRow label="Phone">
            {selectedTicket.ticket.customerPhone}
          </DetailRow>
        ) : null}
        <DetailRow label="Call started">
          {formatTimestamp(selectedTicket.ticket.startedAt)}
        </DetailRow>
        <DetailRow label="Call ended">
          {formatTimestamp(selectedTicket.ticket.endedAt)}
        </DetailRow>

        <div className="grid gap-3 pt-2">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
            Update status
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {(["open", "in_progress", "resolved"] as const).map((status) => (
              <div key={status} className="flex-1">
                <ActionButton
                  busy={props.pendingAction === "updating"}
                  onClick={() =>
                    void props.onStatusChange(selectedTicket.ticket._id, status)
                  }
                  tone={
                    selectedTicket.ticket.status === status
                      ? "primary"
                      : "secondary"
                  }
                >
                  {humanizeStatus(status)}
                </ActionButton>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-2 rounded-md border-2 border-black bg-white p-4 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-sm font-bold uppercase tracking-widest text-[#2a6de1] font-mono">
          Transcript
        </p>
        <div className="max-h-96 overflow-y-auto grid gap-2">
          {selectedTicket.ticket.transcript.length > 0 ? (
            selectedTicket.ticket.transcript.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={[
                  "max-w-[92%] rounded-md px-4 py-3 text-sm leading-6 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                  message.role === "customer"
                    ? "justify-self-start bg-white text-black"
                    : "justify-self-end bg-[#2a6de1] text-white",
                ].join(" ")}
              >
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest opacity-80 font-mono">
                  {message.role}
                </p>
                <p className="font-medium">{message.content}</p>
              </div>
            ))
          ) : (
            <EmptyState message="No transcript saved for this ticket." />
          )}
        </div>
      </div>
    </div>
  );
}
