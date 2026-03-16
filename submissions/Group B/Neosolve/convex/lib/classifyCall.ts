import type {
  SupportCategory,
  TicketPriority,
  TranscriptMessage,
} from "./constants";

type CategoryRule = {
  category: SupportCategory;
  keywords: string[];
  summary: string;
};

type ClassificationInput = {
  customerName: string;
  notes?: string;
  transcript?: TranscriptMessage[];
};

export type CallClassification = {
  category: SupportCategory;
  priority: TicketPriority;
  summary: string;
  isLegitimate: boolean;
  /** Phone number extracted from the transcript text via regex, if found. */
  phoneNumber?: string;
};

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: "slow_internet",
    keywords: [
      "slow internet",
      "slow connection",
      "lag",
      "buffering",
      "speed",
      "latency",
      "streaming",
    ],
    summary:
      "Customer reports unusually slow internet performance affecting everyday usage.",
  },
  {
    category: "connectivity",
    keywords: [
      "disconnect",
      "offline",
      "no internet",
      "cannot connect",
      "can't connect",
      "outage",
      "wifi",
      "drops",
    ],
    summary:
      "Customer cannot keep a stable Neosolve connection and needs follow-up from a connectivity specialist.",
  },
  {
    category: "billing",
    keywords: [
      "billing",
      "bill",
      "invoice",
      "charged",
      "charge",
      "payment",
      "refund",
      "double charge",
    ],
    summary:
      "Customer needs help with a billing or payment issue on the account.",
  },
  {
    category: "account",
    keywords: [
      "account",
      "login",
      "password",
      "subscription",
      "plan",
      "profile",
      "username",
    ],
    summary:
      "Customer needs help accessing or managing their Neosolve account.",
  },
  {
    category: "hardware",
    keywords: [
      "router",
      "modem",
      "device",
      "hardware",
      "broken",
      "blinking",
      "equipment",
    ],
    summary: "Customer reports a hardware issue with their Neosolve equipment.",
  },
  {
    category: "setup",
    keywords: [
      "setup",
      "install",
      "installation",
      "activate",
      "activation",
      "configure",
      "configuration",
      "new service",
    ],
    summary: "Customer needs help setting up or activating Neosolve service.",
  },
];

const NON_SUPPORT_KEYWORDS = [
  "prank",
  "joke",
  "pizza",
  "test call",
  "just testing",
  "wrong number",
];

const URGENT_KEYWORDS = [
  "entire office",
  "business down",
  "emergency",
  "outage",
  "cannot work",
  "can't work",
  "all customers",
];

const HIGH_PRIORITY_KEYWORDS = [
  "all devices",
  "since yesterday",
  "all day",
  "multiple devices",
  "charged twice",
  "keeps disconnecting",
  "broken",
];

const LOW_PRIORITY_KEYWORDS = [
  "question",
  "curious",
  "just checking",
  "how do i",
];

export function classifyCallIntake({
  customerName,
  notes,
  transcript,
}: ClassificationInput): CallClassification {
  const combinedText = [
    customerName,
    notes ?? "",
    ...(transcript ?? []).map((message) => message.content),
  ]
    .join(" ")
    .trim()
    .toLowerCase();

  const isLegitimate = !containsAny(combinedText, NON_SUPPORT_KEYWORDS);

  // Attempt to extract a phone number from the transcript text
  const phoneNumber = extractPhoneFromText(combinedText);

  if (!isLegitimate) {
    const result: CallClassification = {
      category: "general",
      priority: "low",
      summary:
        "The call appears to be a test or non-support request and can be reviewed manually.",
      isLegitimate: false,
    };
    if (phoneNumber) result.phoneNumber = phoneNumber;
    return result;
  }

  const bestRule = CATEGORY_RULES.map((rule) => ({
    rule,
    score: countMatches(combinedText, rule.keywords),
  })).sort((left, right) => right.score - left.score)[0];

  const category =
    bestRule && bestRule.score > 0 ? bestRule.rule.category : "general";
  const priority = pickPriority(combinedText);
  const summary =
    bestRule && bestRule.score > 0
      ? appendSeverity(bestRule.rule.summary, priority)
      : appendSeverity(
          "Customer needs general support follow-up from the Neosolve team.",
          priority,
        );

  return {
    category,
    priority,
    summary,
    isLegitimate: true,
    ...(phoneNumber ? { phoneNumber } : {}),
  };
}

function countMatches(text: string, keywords: string[]): number {
  return keywords.reduce((score, keyword) => {
    return text.includes(keyword) ? score + 1 : score;
  }, 0);
}

function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function pickPriority(text: string): TicketPriority {
  if (containsAny(text, URGENT_KEYWORDS)) {
    return "urgent";
  }
  if (containsAny(text, HIGH_PRIORITY_KEYWORDS)) {
    return "high";
  }
  if (containsAny(text, LOW_PRIORITY_KEYWORDS)) {
    return "low";
  }
  return "medium";
}

function appendSeverity(summary: string, priority: TicketPriority): string {
  switch (priority) {
    case "urgent":
      return `${summary} The issue appears urgent because service impact sounds severe.`;
    case "high":
      return `${summary} The issue affects multiple devices or has lasted long enough to warrant quick follow-up.`;
    case "low":
      return `${summary} The issue sounds low urgency and can be handled in the normal queue.`;
    default:
      return summary;
  }
}

/**
 * Extract a Philippine mobile phone number from free-form text using regex.
 *
 * Recognizes formats like:
 * - +639171234567 / +63 917 123 4567
 * - 09171234567 / 0917-123-4567 / 0917 123 4567
 * - 639171234567
 *
 * Returns the number in E.164 format (+639XXXXXXXXX) or undefined if none found.
 */
export function extractPhoneFromText(text: string): string | undefined {
  // Pattern 1: +63 followed by 10 digits (with optional separators)
  const e164Match = text.match(/\+63[\s-]?9[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}/);
  if (e164Match) {
    const digits = e164Match[0].replace(/[\s-]/g, "");
    return digits; // already +639XXXXXXXXX
  }

  // Pattern 2: 09XX... local format (11 digits with optional separators)
  const localMatch = text.match(
    /(?<!\d)09[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}(?!\d)/,
  );
  if (localMatch) {
    const digits = localMatch[0].replace(/[\s-]/g, "");
    return `+63${digits.slice(1)}`;
  }

  // Pattern 3: 639XX... without + prefix (12 digits)
  const noPlus = text.match(
    /(?<!\d)639[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}(?!\d)/,
  );
  if (noPlus) {
    const digits = noPlus[0].replace(/[\s-]/g, "");
    return `+${digits}`;
  }

  return undefined;
}
