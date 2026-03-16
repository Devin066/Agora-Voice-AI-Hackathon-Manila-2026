import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  SectionHeading,
  Tag,
  EmptyState,
  getErrorMessage,
  humanizeToken,
  humanizeStatus,
} from "../components/ui";
import { TicketDetail } from "../components/TicketDetail";

export function AgentView(props: { slug: string }) {
  const [selectedTicketId, setSelectedTicketId] =
    useState<Id<"tickets"> | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateStatus = useMutation(api.tickets.updateStatus);

  const dashboard = useQuery(api.tickets.agentDashboard, {
    agentSlug: props.slug,
  });
  const selectedTicket = useQuery(
    api.tickets.getTicketDetail,
    selectedTicketId ? { ticketId: selectedTicketId } : "skip",
  );

  // Auto-select first ticket
  useEffect(() => {
    const firstTicket = dashboard?.tickets[0]?._id ?? null;
    if (!selectedTicketId && firstTicket) {
      setSelectedTicketId(firstTicket);
      return;
    }

    if (
      selectedTicketId &&
      dashboard &&
      !dashboard.tickets.some((ticket) => ticket._id === selectedTicketId)
    ) {
      setSelectedTicketId(firstTicket);
    }
  }, [dashboard, selectedTicketId]);

  // Reset selection when agent changes
  useEffect(() => {
    setSelectedTicketId(null);
  }, [props.slug]);

  // Auto-dismiss feedback and error messages
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(null), 8000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  async function handleStatusChange(
    ticketId: Id<"tickets">,
    status: "open" | "in_progress" | "resolved",
  ) {
    setPendingAction("updating");
    setFeedback(null);
    setErrorMessage(null);

    try {
      await updateStatus({ ticketId, status });
      setFeedback(`Ticket marked as ${humanizeStatus(status)}.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  }

  if (!dashboard) {
    return (
      <section className="rounded-md border-2 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:p-5">
        <EmptyState
          message={`Loading agent dashboard for "${props.slug}"...`}
        />
      </section>
    );
  }

  if (!dashboard.agent) {
    return (
      <section className="rounded-md border-2 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:p-5">
        <EmptyState message={`No agent found with slug "${props.slug}".`} />
      </section>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[350px_1fr] 2xl:grid-cols-[450px_1fr] xl:items-start">
      <div className="flex flex-col gap-4">
        <div className="rounded-md border-2 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:p-5 flex flex-col h-[calc(100vh-2rem)] xl:h-auto overflow-y-auto">
          <SectionHeading
            eyebrow={`Agent: ${dashboard.agent.name}`}
            title={`${dashboard.agent.name}'s Dashboard`}
            description={`Specialties: ${dashboard.agent.specialties.map((s: string) => humanizeToken(s)).join(", ")}`}
          />

          <div className="mt-4 grid gap-3">
            {dashboard.tickets.length > 0 ? (
              dashboard.tickets.map((ticket) => {
                const isSelected = ticket._id === selectedTicketId;
                return (
                  <button
                    key={ticket._id}
                    type="button"
                    onClick={() => setSelectedTicketId(ticket._id)}
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
                message={`No tickets assigned to ${dashboard.agent.name} yet.`}
              />
            )}
          </div>
        </div>
      </div>

      <div className="rounded-md border-2 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:p-5 xl:sticky xl:top-4 flex flex-col h-[calc(100vh-2rem)] xl:h-auto overflow-y-auto">
        <SectionHeading eyebrow="Ticket detail" title="Selected Ticket" />

        <div className="mt-4">
          <TicketDetail
            selectedTicket={selectedTicket}
            onStatusChange={(ticketId, status) =>
              void handleStatusChange(ticketId, status)
            }
            pendingAction={pendingAction}
          />
        </div>
      </div>

      {feedback ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {feedback}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}
