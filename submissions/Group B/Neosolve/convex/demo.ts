import { mutation } from "./_generated/server";
import { ensureSeededAgents } from "./lib/demoData";

export const ensureDemoReady = mutation({
  args: {},
  handler: async (ctx) => {
    const agents = await ensureSeededAgents(ctx.db);
    return {
      agentCount: agents.length,
    };
  },
});

export const resetDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const tickets = await ctx.db.query("tickets").collect();
    for (const ticket of tickets) {
      await ctx.db.delete(ticket._id);
    }

    const calls = await ctx.db.query("calls").collect();
    for (const call of calls) {
      await ctx.db.delete(call._id);
    }

    const supportAgents = await ctx.db.query("supportAgents").collect();
    for (const agent of supportAgents) {
      await ctx.db.delete(agent._id);
    }

    const seededAgents = await ensureSeededAgents(ctx.db);

    return {
      reset: true,
      agentCount: seededAgents.length,
    };
  },
});
