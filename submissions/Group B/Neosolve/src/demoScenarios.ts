export type DemoTranscriptMessage = {
  role: "customer" | "assistant" | "system";
  content: string;
};

export type DemoScenario = {
  id: string;
  title: string;
  preview: string;
  channelPrefix: string;
  notes: string;
  transcript: DemoTranscriptMessage[];
  expectedCategory:
    | "slow_internet"
    | "connectivity"
    | "billing"
    | "account"
    | "hardware"
    | "setup"
    | "general";
  expectedPriority: "low" | "medium" | "high" | "urgent";
  expectedAgent: "Kean" | "Maya" | "Carlos";
};

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "slow-internet",
    title: "Slow internet at home office",
    preview: "Customer reports slow speeds across all devices.",
    channelPrefix: "neosolve-slow",
    notes:
      "My internet has been very slow since yesterday. Video calls keep lagging and streaming buffers on all devices in the house.",
    transcript: [
      {
        role: "assistant",
        content:
          "Hello! Thank you for calling Neosolve support. My name is Neo. How can I help you today?",
      },
      {
        role: "customer",
        content:
          "My internet has been very slow since yesterday and every video call keeps lagging.",
      },
      {
        role: "assistant",
        content:
          "I am sorry to hear that. Is the issue happening on one device or on multiple devices?",
      },
      {
        role: "customer",
        content:
          "It is happening on all devices in the house and streaming keeps buffering too.",
      },
      {
        role: "assistant",
        content:
          "Thanks, I have enough to create a support ticket for a specialist.",
      },
    ],
    expectedCategory: "slow_internet",
    expectedPriority: "high",
    expectedAgent: "Kean",
  },
  {
    id: "billing-charge",
    title: "Double charge billing complaint",
    preview: "Customer disputes a duplicate charge on their bill.",
    channelPrefix: "neosolve-billing",
    notes:
      "I was charged twice on my latest bill and I need someone to review the invoice before the next payment date.",
    transcript: [
      {
        role: "assistant",
        content:
          "Hello! Thank you for calling Neosolve support. My name is Neo. How can I help you today?",
      },
      {
        role: "customer",
        content:
          "I think I was charged twice on my latest bill and the invoice amount looks wrong.",
      },
      {
        role: "assistant",
        content: "Understood. When did you first notice the billing issue?",
      },
      {
        role: "customer",
        content:
          "This morning when I reviewed the payment notification in my account.",
      },
      {
        role: "assistant",
        content:
          "Thank you. I will log this for one of our billing specialists.",
      },
    ],
    expectedCategory: "billing",
    expectedPriority: "high",
    expectedAgent: "Maya",
  },
  {
    id: "router-hardware",
    title: "Router hardware failure",
    preview: "Customer reports router with blinking red light and dropouts.",
    channelPrefix: "neosolve-hardware",
    notes:
      "The router looks broken. The power light keeps blinking red and the device disconnects every few minutes.",
    transcript: [
      {
        role: "assistant",
        content:
          "Hello! Thank you for calling Neosolve support. My name is Neo. How can I help you today?",
      },
      {
        role: "customer",
        content:
          "My router looks broken. The power light keeps blinking red and the device disconnects every few minutes.",
      },
      {
        role: "assistant",
        content: "I understand. When did the equipment issue begin?",
      },
      {
        role: "customer",
        content:
          "It started this afternoon after the device rebooted on its own.",
      },
      {
        role: "assistant",
        content:
          "Thanks. I will create a ticket so a hardware specialist can follow up.",
      },
    ],
    expectedCategory: "hardware",
    expectedPriority: "high",
    expectedAgent: "Carlos",
  },
];

export function getScenarioById(id: string): DemoScenario {
  return (
    DEMO_SCENARIOS.find((scenario) => scenario.id === id) ?? DEMO_SCENARIOS[0]
  );
}
