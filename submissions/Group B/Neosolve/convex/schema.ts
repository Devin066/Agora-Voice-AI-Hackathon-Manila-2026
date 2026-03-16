import { defineSchema, defineTable } from "convex/server";
import {
  callStatusValidator,
  supportCategoryValidator,
  ticketPriorityValidator,
  ticketStatusValidator,
  transcriptValidator,
} from "./lib/validators";
import { v } from "convex/values";

export default defineSchema({
  supportAgents: defineTable({
    slug: v.string(),
    name: v.string(),
    specialties: v.array(supportCategoryValidator),
    avatar: v.string(),
    available: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_available", ["available"]),
  calls: defineTable({
    channelName: v.optional(v.string()),
    agoraAgentId: v.optional(v.string()),
    status: callStatusValidator,
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    notes: v.optional(v.string()),
    transcript: v.optional(transcriptValidator),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    ticketId: v.optional(v.id("tickets")),
  })
    .index("by_status", ["status"])
    .index("by_startedAt", ["startedAt"]),
  tickets: defineTable({
    callId: v.id("calls"),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    category: supportCategoryValidator,
    priority: ticketPriorityValidator,
    summary: v.string(),
    transcript: transcriptValidator,
    assignedAgentId: v.optional(v.id("supportAgents")),
    assignedAgentName: v.optional(v.string()),
    assignedAgentSlug: v.optional(v.string()),
    assignmentReason: v.string(),
    status: ticketStatusValidator,
    isLegitimate: v.boolean(),
    smsNotificationSent: v.optional(v.boolean()),

    startedAt: v.number(),
    endedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_callId", ["callId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_createdAt", ["createdAt"]),
});
