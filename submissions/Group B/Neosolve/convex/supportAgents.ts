import { v } from "convex/values";
import { query } from "./_generated/server";
import { OPEN_TICKET_STATUSES } from "./lib/constants";
import { sortAgents } from "./lib/demoData";

export const listAgents = query({
  args: {},
  handler: async (ctx) => {
    const agents = sortAgents(await ctx.db.query("supportAgents").collect());
    const tickets = await ctx.db.query("tickets").collect();

    return agents.map((agent) => {
      const assignedTickets = tickets.filter(
        (ticket) => ticket.assignedAgentId === agent._id,
      );
      return {
        ...agent,
        workload: {
          open: assignedTickets.filter((ticket) => ticket.status === "open")
            .length,
          inProgress: assignedTickets.filter(
            (ticket) => ticket.status === "in_progress",
          ).length,
          resolved: assignedTickets.filter(
            (ticket) => ticket.status === "resolved",
          ).length,
          active: assignedTickets.filter((ticket) =>
            OPEN_TICKET_STATUSES.includes(ticket.status),
          ).length,
        },
      };
    });
  },
});

export const getAgentBySlug = query({
  args: {
    agentSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("supportAgents")
      .withIndex("by_slug", (queryBuilder) =>
        queryBuilder.eq("slug", args.agentSlug),
      )
      .unique();

    if (!agent) {
      return null;
    }

    const tickets = await ctx.db.query("tickets").collect();
    const assignedTickets = tickets.filter(
      (ticket) => ticket.assignedAgentId === agent._id,
    );

    return {
      ...agent,
      workload: {
        open: assignedTickets.filter((ticket) => ticket.status === "open")
          .length,
        inProgress: assignedTickets.filter(
          (ticket) => ticket.status === "in_progress",
        ).length,
        resolved: assignedTickets.filter(
          (ticket) => ticket.status === "resolved",
        ).length,
        active: assignedTickets.filter((ticket) =>
          OPEN_TICKET_STATUSES.includes(ticket.status),
        ).length,
      },
    };
  },
});
