import type { Doc } from "../_generated/dataModel";
import { OPEN_TICKET_STATUSES, type SupportCategory } from "./constants";

type AssignmentResult = {
  agent: Doc<"supportAgents"> | null;
  reason: string;
};

export function assignBestAgent(args: {
  category: SupportCategory;
  agents: Doc<"supportAgents">[];
  tickets: Doc<"tickets">[];
}): AssignmentResult {
  const availableAgents = args.agents.filter((agent) => agent.available);

  if (availableAgents.length === 0) {
    return {
      agent: null,
      reason: "No agents currently available",
    };
  }

  const specialists = availableAgents.filter((agent) =>
    agent.specialties.includes(args.category),
  );

  const pickFrom = specialists.length > 0 ? specialists : availableAgents;
  const agent = [...pickFrom].sort((left, right) => {
    const workloadDifference =
      openTicketCount(left._id, args.tickets) -
      openTicketCount(right._id, args.tickets);
    if (workloadDifference !== 0) {
      return workloadDifference;
    }
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }
    return left.name.localeCompare(right.name);
  })[0];

  if (specialists.length > 0) {
    return {
      agent,
      reason: `Assigned to ${agent.name} - specialist in ${humanizeCategory(args.category)}`,
    };
  }

  return {
    agent,
    reason: `Assigned to ${agent.name} - fallback based on the lightest open workload`,
  };
}

function openTicketCount(
  agentId: Doc<"supportAgents">["_id"],
  tickets: Doc<"tickets">[],
): number {
  return tickets.filter((ticket) => {
    return (
      ticket.assignedAgentId === agentId &&
      OPEN_TICKET_STATUSES.includes(ticket.status)
    );
  }).length;
}

function humanizeCategory(category: SupportCategory): string {
  return category.replace(/_/g, " ");
}
