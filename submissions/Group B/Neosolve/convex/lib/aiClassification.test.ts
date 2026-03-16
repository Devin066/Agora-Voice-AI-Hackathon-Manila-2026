import { describe, expect, it } from "vitest";
import {
  buildClassificationPrompt,
  normalizeClassificationResult,
  normalizePhoneNumber,
} from "./aiClassification";
import { extractPhoneFromText } from "./classifyCall";

describe("aiClassification helpers", () => {
  it("builds a classification prompt from transcript lines", () => {
    expect(
      buildClassificationPrompt([
        { role: "customer", content: "My router is blinking red." },
        { role: "assistant", content: "When did this start?" },
      ]),
    ).toContain("customer: My router is blinking red.");
  });

  it("prompt mentions phoneNumber extraction", () => {
    const prompt = buildClassificationPrompt([
      { role: "customer", content: "Hello" },
    ]);
    expect(prompt).toContain("phoneNumber");
    expect(prompt).toContain("+63");
  });

  it("normalizes valid model output", () => {
    expect(
      normalizeClassificationResult({
        category: "hardware",
        priority: "high",
        summary: "Router appears to be failing and disconnecting frequently.",
        isLegitimate: true,
      }),
    ).toEqual({
      category: "hardware",
      priority: "high",
      summary: "Router appears to be failing and disconnecting frequently.",
      isLegitimate: true,
    });
  });

  it("normalizes model output with a valid phone number", () => {
    expect(
      normalizeClassificationResult({
        category: "billing",
        priority: "medium",
        summary: "Billing issue.",
        isLegitimate: true,
        phoneNumber: "+639171234567",
      }),
    ).toEqual({
      category: "billing",
      priority: "medium",
      summary: "Billing issue.",
      isLegitimate: true,
      phoneNumber: "+639171234567",
    });
  });

  it("strips invalid phone number from model output", () => {
    const result = normalizeClassificationResult({
      category: "general",
      priority: "low",
      summary: "Test.",
      isLegitimate: true,
      phoneNumber: "not a phone",
    });
    expect(result.phoneNumber).toBeUndefined();
  });

  it("falls back to safe defaults when model output is malformed", () => {
    expect(
      normalizeClassificationResult({
        category: "wrong",
        priority: 99,
        summary: "",
        isLegitimate: "maybe",
      }),
    ).toEqual({
      category: "general",
      priority: "medium",
      summary:
        "Customer needs general support follow-up from the Neosolve team.",
      isLegitimate: true,
    });
  });
});

describe("normalizePhoneNumber", () => {
  it("accepts E.164 Philippine format", () => {
    expect(normalizePhoneNumber("+639171234567")).toBe("+639171234567");
  });

  it("converts local 09XX format to E.164", () => {
    expect(normalizePhoneNumber("09171234567")).toBe("+639171234567");
  });

  it("converts 639XX format (no plus) to E.164", () => {
    expect(normalizePhoneNumber("639171234567")).toBe("+639171234567");
  });

  it("handles dashes and spaces", () => {
    expect(normalizePhoneNumber("0917-123-4567")).toBe("+639171234567");
    expect(normalizePhoneNumber("+63 917 123 4567")).toBe("+639171234567");
  });

  it("returns undefined for invalid input", () => {
    expect(normalizePhoneNumber("not a phone")).toBeUndefined();
    expect(normalizePhoneNumber("")).toBeUndefined();
    expect(normalizePhoneNumber(null)).toBeUndefined();
    expect(normalizePhoneNumber(123)).toBeUndefined();
  });
});

describe("extractPhoneFromText", () => {
  it("extracts +63 E.164 number from text", () => {
    expect(
      extractPhoneFromText("You can reach me at +639171234567, thanks"),
    ).toBe("+639171234567");
  });

  it("extracts local 09XX format and converts to E.164", () => {
    expect(
      extractPhoneFromText("My number is 0917-123-4567 for follow up"),
    ).toBe("+639171234567");
  });

  it("extracts 639XX format without plus", () => {
    expect(extractPhoneFromText("call me at 639171234567")).toBe(
      "+639171234567",
    );
  });

  it("extracts number with spaces", () => {
    expect(extractPhoneFromText("my cell is 0917 123 4567")).toBe(
      "+639171234567",
    );
  });

  it("returns undefined when no phone number is present", () => {
    expect(
      extractPhoneFromText("I have a billing problem with my account"),
    ).toBeUndefined();
  });
});
