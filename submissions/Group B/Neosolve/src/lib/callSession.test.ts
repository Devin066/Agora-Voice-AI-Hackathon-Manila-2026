import { describe, expect, it } from "vitest";
import {
  buildChannelName,
  compactTranscriptSegments,
  formatAgoraUid,
} from "./callSession";

describe("callSession helpers", () => {
  it("builds a stable channel name from the customer name", () => {
    expect(buildChannelName("  Alyssa P. Hacker  ", 1711111111111)).toBe(
      "neosolve-alyssa-p-hacker-1711111111111",
    );
  });

  it("falls back to anonymous when the name is empty", () => {
    expect(buildChannelName("   ", 1711111111111)).toBe(
      "neosolve-anonymous-1711111111111",
    );
  });

  it("compacts repeated transcript messages by role", () => {
    expect(
      compactTranscriptSegments([
        { role: "customer", content: "My internet" },
        { role: "customer", content: "keeps dropping" },
        { role: "assistant", content: "I can help with that." },
        { role: "assistant", content: "When did it start?" },
      ]),
    ).toEqual([
      { role: "customer", content: "My internet keeps dropping" },
      {
        role: "assistant",
        content: "I can help with that. When did it start?",
      },
    ]);
  });

  it("formats Agora uids as strings", () => {
    expect(formatAgoraUid(42)).toBe("42");
  });
});
