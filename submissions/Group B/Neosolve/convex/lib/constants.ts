export const SUPPORT_CATEGORIES = [
  "slow_internet",
  "connectivity",
  "billing",
  "account",
  "hardware",
  "setup",
  "general",
] as const;

export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];

export const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TICKET_STATUSES = ["open", "in_progress", "resolved"] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const CALL_STATUSES = ["waiting", "active", "ended"] as const;

export type CallStatus = (typeof CALL_STATUSES)[number];

export type TranscriptMessage = {
  role: "customer" | "assistant" | "system";
  content: string;
};

export const SUPPORT_AGENT_SEED = [
  {
    slug: "kean",
    name: "Kean",
    specialties: ["slow_internet", "connectivity"] as SupportCategory[],
    avatar: "KN",
    available: true,
    sortOrder: 0,
  },
  {
    slug: "maya",
    name: "Maya",
    specialties: ["billing", "account"] as SupportCategory[],
    avatar: "MY",
    available: true,
    sortOrder: 1,
  },
  {
    slug: "carlos",
    name: "Carlos",
    specialties: ["hardware", "setup"] as SupportCategory[],
    avatar: "CR",
    available: true,
    sortOrder: 2,
  },
] as const;

export const OPEN_TICKET_STATUSES: TicketStatus[] = ["open", "in_progress"];
