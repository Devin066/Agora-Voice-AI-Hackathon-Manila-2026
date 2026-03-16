import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  SectionHeading,
  Panel,
  MetricPanel,
  EmptyState,
  getErrorMessage,
  humanizeStatus,
} from "../components/ui";
import { ActiveCalls } from "../components/ActiveCalls";
import { TicketQueue } from "../components/TicketQueue";
import { TicketDetail } from "../components/TicketDetail";
import { AgentLane } from "../components/AgentLane";

type PendingAction = "ending" | "updating" | null;

export function LeadDashboard() {
  const [selectedTicketId, setSelectedTicketId] =
    useState<Id<"tickets"> | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const endCallMutation = useMutation(api.calls.endCall);
  const updateStatus = useMutation(api.tickets.updateStatus);

  const leadDashboard = useQuery(api.tickets.leadDashboard, {});
  const supportAgents = useQuery(api.supportAgents.listAgents, {});
  const activeCalls = useQuery(api.calls.listCalls, {
    status: "active",
    limit: 10,
  });
  const selectedTicket = useQuery(
    api.tickets.getTicketDetail,
    selectedTicketId ? { ticketId: selectedTicketId } : "skip",
  );

  useEffect(() => {
    const firstTicket = leadDashboard?.tickets[0]?._id ?? null;
    if (!selectedTicketId && firstTicket) {
      setSelectedTicketId(firstTicket);
      return;
    }

    if (
      selectedTicketId &&
      leadDashboard &&
      !leadDashboard.tickets.some((ticket) => ticket._id === selectedTicketId)
    ) {
      setSelectedTicketId(firstTicket);
    }
  }, [leadDashboard, selectedTicketId]);

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

  async function handleEndDemoCall(callId: Id<"calls">) {
    setPendingAction("ending");
    setFeedback(null);
    setErrorMessage(null);

    try {
      const result = await endCallMutation({ callId });
      setSelectedTicketId(result.ticketId);
      setFeedback(
        result.assignedAgentName
          ? `Ticket routed to ${result.assignedAgentName}.`
          : "Ticket created without an assigned agent.",
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  }

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

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_550px] 2xl:grid-cols-[1fr_650px] xl:items-start">
      <div className="flex flex-col gap-4">
        <header className="overflow-hidden rounded-md border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="grid gap-4 px-5 py-5 lg:grid-cols-[1.5fr_1fr] lg:px-6">
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-sm border-2 border-black bg-[#f5ce4d] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black">
                Neosolve AI support
              </span>
              <h1 className="max-w-3xl text-3xl font-black tracking-tight text-black sm:text-4xl">
                Voice AI Support Intake
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-md border-2 border-black bg-slate-900 p-4 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <MetricPanel
                label="Active calls"
                value={String(leadDashboard?.metrics.activeCalls ?? 0)}
                tone="cyan"
              />
              <MetricPanel
                label="Open tickets"
                value={String(leadDashboard?.metrics.openTickets ?? 0)}
                tone="amber"
              />
              <MetricPanel
                label="In progress"
                value={String(leadDashboard?.metrics.inProgressTickets ?? 0)}
                tone="cyan"
              />
              <MetricPanel
                label="Resolved"
                value={String(leadDashboard?.metrics.resolvedTickets ?? 0)}
                tone="amber"
              />
            </div>
          </div>
        </header>

        <div className="rounded-md border-2 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:p-5">
          <SectionHeading
            eyebrow="Live operations"
            title="Team Lead Dashboard"
          />

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="grid gap-3">
              <Panel title="Active calls">
                <ActiveCalls
                  calls={activeCalls}
                  onEndDemoCall={(callId) => void handleEndDemoCall(callId)}
                  pendingAction={pendingAction}
                />
              </Panel>
            </div>

            <div className="grid gap-3">
              <Panel title="Ticket queue">
                <TicketQueue
                  tickets={leadDashboard?.tickets ?? []}
                  selectedTicketId={selectedTicketId}
                  onSelectTicket={setSelectedTicketId}
                />
              </Panel>
            </div>
          </div>
        </div>

        <div className="rounded-md border-2 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:p-5">
          <SectionHeading
            eyebrow="Support lanes"
            title="Per-Agent Dashboards"
          />

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {supportAgents && supportAgents.length > 0 ? (
              supportAgents.map((agent) => (
                <AgentLane
                  key={agent._id}
                  agentName={agent.name}
                  agentSlug={agent.slug}
                  specialties={agent.specialties}
                  activeCount={agent.workload.active}
                  onSelectTicket={setSelectedTicketId}
                  selectedTicketId={selectedTicketId}
                />
              ))
            ) : (
              <EmptyState message="No agents loaded yet." />
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
