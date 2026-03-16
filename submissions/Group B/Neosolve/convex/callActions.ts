/**
 * Convex actions for the real Agora voice call flow.
 *
 * Separated from calls.ts (mutations/queries) to keep the action
 * that orchestrates Agora + OpenRouter + endCall in its own module.
 */

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { classifyWithLLM } from "./lib/aiClassification";
import type { Id } from "./_generated/dataModel";
import type { TranscriptMessage } from "./lib/constants";

type ProcessCallEndResult = {
  callId: Id<"calls">;
  ticketId: Id<"tickets">;
  assignmentReason: string;
  assignedAgentName: string | null;
};

/**
 * Full end-to-end action for real Agora calls:
 * 1. Fetch transcript from Agora conversation history
 * 2. Stop the Agora AI agent
 * 3. Classify with OpenRouter (falls back to keyword classifier if no key or on error)
 * 4. End the call and create a ticket via the endCall mutation
 *
 * This is the action the browser calls when a real voice call ends.
 */
export const processCallEnd = action({
  args: {
    callId: v.id("calls"),
    agentId: v.string(),
  },
  handler: async (ctx, args): Promise<ProcessCallEndResult> => {
    // 1. Fetch transcript from Agora before stopping the agent
    let transcript: TranscriptMessage[] = [];
    try {
      const historyResult = await ctx.runAction(api.agora.getAgentHistory, {
        agentId: args.agentId,
      });
      transcript = historyResult.transcript;
    } catch (error) {
      console.warn(
        "Failed to fetch agent history, proceeding with empty transcript:",
        error,
      );
    }

    // 2. Stop the AI agent
    try {
      await ctx.runAction(api.agora.stopAgent, {
        agentId: args.agentId,
      });
    } catch (error) {
      console.warn("Failed to stop agent (may have already left):", error);
    }

    // 3. Classify with OpenRouter (fall back to keyword classifier in endCall)
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    let aiClassification:
      | {
          category:
            | "slow_internet"
            | "connectivity"
            | "billing"
            | "account"
            | "hardware"
            | "setup"
            | "general";
          priority: "low" | "medium" | "high" | "urgent";
          summary: string;
          isLegitimate: boolean;
          phoneNumber?: string;
        }
      | undefined;

    if (openRouterKey && transcript.length > 0) {
      try {
        const result = await classifyWithLLM(transcript, openRouterKey);
        aiClassification = {
          category: result.category,
          priority: result.priority,
          summary: result.summary,
          isLegitimate: result.isLegitimate,
          ...(result.phoneNumber ? { phoneNumber: result.phoneNumber } : {}),
        };
      } catch (error) {
        console.warn(
          "OpenRouter classification failed, falling back to keyword classifier:",
          error,
        );
      }
    }

    // 4. End call and create ticket via mutation
    // The endCall mutation uses the keyword classifier as fallback
    // when aiClassification is not provided.
    const mutationResult = await ctx.runMutation(api.calls.endCall, {
      callId: args.callId,
      transcript,
      aiClassification,
    });

    return {
      callId: mutationResult.callId,
      ticketId: mutationResult.ticketId,
      assignmentReason: mutationResult.assignmentReason,
      assignedAgentName: mutationResult.assignedAgentName,
    };
  },
});
