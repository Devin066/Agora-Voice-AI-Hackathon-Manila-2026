/**
 * Agora integration actions for Convex.
 *
 * Uses the Agent Studio pipeline_id approach:
 * - The ASR, LLM, and TTS are pre-configured in Agora Agent Studio
 * - We only need to pass the pipeline_id + channel info to start the agent
 * - Agora manages all model credentials via "Agora Managed Key"
 *
 * Actions handle:
 * 1. Starting the Conversational AI agent via Agora REST API
 * 2. Stopping the AI agent
 * 3. Fetching conversation history from the AI agent
 * 4. Generating/providing an Agora RTC token
 */

import { v } from "convex/values";
import { action } from "./_generated/server";

function getAgoraCredentials() {
  const appId = process.env.AGORA_APP_ID;
  const customerKey = process.env.AGORA_CUSTOMER_KEY;
  const customerSecret = process.env.AGORA_CUSTOMER_SECRET;

  if (!appId) throw new Error("AGORA_APP_ID environment variable is not set");
  if (!customerKey)
    throw new Error("AGORA_CUSTOMER_KEY environment variable is not set");
  if (!customerSecret)
    throw new Error("AGORA_CUSTOMER_SECRET environment variable is not set");

  const plainCredentials = `${customerKey}:${customerSecret}`;
  const base64Credentials = btoa(plainCredentials);

  return { appId, base64Credentials };
}

function getPipelineId(): string {
  const pipelineId = process.env.AGORA_PIPELINE_ID;
  if (!pipelineId)
    throw new Error("AGORA_PIPELINE_ID environment variable is not set");
  return pipelineId;
}

/**
 * Start the Conversational AI agent and have it join the specified
 * Agora channel. Uses the pipeline_id from Agent Studio — all ASR,
 * LLM, and TTS configuration is pre-set in the Agora Console.
 */
export const startAgent = action({
  args: {
    channelName: v.string(),
    customerUid: v.string(),
    token: v.string(),
  },
  handler: async (_ctx, args) => {
    const { appId, base64Credentials } = getAgoraCredentials();
    const pipelineId = getPipelineId();

    const agentName = `nova-${args.channelName}-${Date.now()}`;

    const body = {
      name: agentName,
      pipeline_id: pipelineId,
      properties: {
        channel: args.channelName,
        token: args.token,
        agent_rtc_uid: "0",
        remote_rtc_uids: ["*"],
        idle_timeout: 120,
      },
    };

    const response = await fetch(
      `https://api.agora.io/api/conversational-ai-agent/v2/projects/${appId}/join`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${base64Credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Failed to start Agora AI agent (${response.status}): ${text.slice(0, 500)}`,
      );
    }

    const result = (await response.json()) as {
      agent_id: string;
      create_ts: number;
      status: string;
    };

    return {
      agentId: result.agent_id,
      createTs: result.create_ts,
      status: result.status,
    };
  },
});

/**
 * Stop the Conversational AI agent and have it leave the channel.
 */
export const stopAgent = action({
  args: {
    agentId: v.string(),
  },
  handler: async (_ctx, args) => {
    const { appId, base64Credentials } = getAgoraCredentials();

    const response = await fetch(
      `https://api.agora.io/api/conversational-ai-agent/v2/projects/${appId}/agents/${args.agentId}/leave`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${base64Credentials}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Failed to stop Agora AI agent (${response.status}): ${text.slice(0, 500)}`,
      );
    }

    return { stopped: true };
  },
});

/**
 * Retrieve the conversation history from a running AI agent.
 * Returns transcript messages in our app's format.
 */
export const getAgentHistory = action({
  args: {
    agentId: v.string(),
  },
  handler: async (_ctx, args) => {
    const { appId, base64Credentials } = getAgoraCredentials();

    const response = await fetch(
      `https://api.agora.io/api/conversational-ai-agent/v2/projects/${appId}/agents/${args.agentId}/history`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${base64Credentials}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Failed to get agent history (${response.status}): ${text.slice(0, 500)}`,
      );
    }

    const data = (await response.json()) as {
      agent_id: string;
      status: string;
      contents?: Array<{ role: string; content: string }>;
    };

    const transcript = (data.contents ?? []).map((entry) => ({
      role:
        entry.role === "user" ? ("customer" as const) : ("assistant" as const),
      content: entry.content,
    }));

    return { transcript };
  },
});

/**
 * Generate an Agora RTC token for a channel.
 *
 * For now, uses a temporary token from the Agora Console or
 * testing mode (no token required). In production, implement
 * proper token generation via a token server.
 */
export const generateToken = action({
  args: {
    channelName: v.string(),
    uid: v.number(),
  },
  handler: async (_ctx, _args) => {
    const { appId } = getAgoraCredentials();

    // Use a temporary token generated from Agora Console.
    // Go to Console → Project → Security → Generate Temp Token.
    // Temp tokens are valid for 24 hours.
    const tempToken = process.env.AGORA_TEMP_TOKEN ?? "";
    if (!tempToken) {
      throw new Error(
        "AGORA_TEMP_TOKEN is not set. Generate one in Agora Console → Project → Security → Generate Temp Token.",
      );
    }
    return { token: tempToken, appId };
  },
});
