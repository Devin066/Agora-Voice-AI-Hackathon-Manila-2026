/**
 * Helpers for Agora call session management.
 * Builds channel names, compacts real-time transcript segments,
 * and formats Agora UIDs for display.
 */

export type TranscriptSegment = {
  role: "customer" | "assistant" | "system";
  content: string;
};

/**
 * Build a deterministic, URL-safe Agora channel name from the customer name
 * and a timestamp. Falls back to "anonymous" when the name is blank.
 */
export function buildChannelName(
  customerName: string,
  timestamp: number,
): string {
  const slug =
    customerName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "anonymous";

  return `neosolve-${slug}-${timestamp}`;
}

/**
 * Merge consecutive transcript segments that share the same role into a
 * single segment. This is useful when Agora's real-time ASR produces
 * multiple small chunks for one continuous utterance.
 */
export function compactTranscriptSegments(
  segments: TranscriptSegment[],
): TranscriptSegment[] {
  if (segments.length === 0) return [];

  const result: TranscriptSegment[] = [];
  let current: TranscriptSegment = { ...segments[0] };

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    if (segment.role === current.role) {
      current.content += " " + segment.content;
    } else {
      result.push(current);
      current = { ...segment };
    }
  }

  result.push(current);
  return result;
}

/**
 * Format an Agora numeric UID as a string for display / storage.
 */
export function formatAgoraUid(uid: number): string {
  return String(uid);
}
