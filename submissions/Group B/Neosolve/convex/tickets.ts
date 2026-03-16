import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { OPEN_TICKET_STATUSES } from "./lib/constants";
import {
  supportCategoryValidator,
  ticketStatusValidator,
} from "./lib/validators";
import { sortAgents } from "./lib/demoData";

export const leadDashboard = query({
  args: {
    status: v.optional(ticketStatusValidator),
    category: v.optional(supportCategoryValidator),
    agentSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const [tickets, calls, agents] = await Promise.all([
      ctx.db.query("tickets").collect(),
      ctx.db.query("calls").collect(),
      ctx.db.query("supportAgents").collect(),
    ]);

    const sortedAgents = sortAgents(agents);
    const filteredTickets = tickets
      .filter((ticket) => (args.status ? ticket.status === args.status : true))
      .filter((ticket) =>
        args.category ? ticket.category === args.category : true,
      )
      .filter((ticket) =>
        args.agentSlug ? ticket.assignedAgentSlug === args.agentSlug : true,
      )
      .sort((left, right) => right.createdAt - left.createdAt);

    const workloads = sortedAgents.map((agent) => {
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

    return {
      metrics: {
        activeCalls: calls.filter((call) => call.status === "active").length,
        openTickets: tickets.filter((ticket) => ticket.status === "open")
          .length,
        inProgressTickets: tickets.filter(
          (ticket) => ticket.status === "in_progress",
        ).length,
        resolvedTickets: tickets.filter(
          (ticket) => ticket.status === "resolved",
        ).length,
        unassignedTickets: tickets.filter((ticket) => !ticket.assignedAgentId)
          .length,
      },
      activeCalls: calls
        .filter((call) => call.status === "active")
        .sort((left, right) => right.startedAt - left.startedAt),
      tickets: filteredTickets,
      workloads,
    };
  },
});

export const agentDashboard = query({
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

    const tickets = (await ctx.db.query("tickets").collect())
      .filter((ticket) => ticket.assignedAgentSlug === args.agentSlug)
      .sort((left, right) => right.createdAt - left.createdAt);

    return {
      agent,
      tickets,
      metrics: {
        open: tickets.filter((ticket) => ticket.status === "open").length,
        inProgress: tickets.filter((ticket) => ticket.status === "in_progress")
          .length,
        resolved: tickets.filter((ticket) => ticket.status === "resolved")
          .length,
      },
    };
  },
});

export const getTicketDetail = query({
  args: {
    ticketId: v.id("tickets"),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      return null;
    }

    const [call, agent] = await Promise.all([
      ctx.db.get(ticket.callId),
      ticket.assignedAgentId
        ? ctx.db.get(ticket.assignedAgentId)
        : Promise.resolve(null),
    ]);

    return {
      ticket,
      call,
      agent,
    };
  },
});

export const updateStatus = mutation({
  args: {
    ticketId: v.id("tickets"),
    status: ticketStatusValidator,
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found.");
    }

    await ctx.db.patch(ticket._id, {
      status: args.status,
    });

    return {
      ticketId: ticket._id,
      status: args.status,
    };
  },
});
