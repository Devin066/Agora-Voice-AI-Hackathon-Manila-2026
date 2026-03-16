import { createClient } from "@/lib/supabase";
import type { SessionScore, FeedbackChip } from "@/types";

// ── Child Profile ──────────────────────────────────────────────

export async function saveChildProfile(
  parentId: string,
  name: string,
  age: number
) {
  const supabase = createClient();
  const ageGroup = age <= 7 ? "early" : age <= 10 ? "growing" : "preteen";

  const { data, error } = await supabase
    .from("child_profiles")
    .insert({ parent_id: parentId, name, age, age_group: ageGroup })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getChildProfile(parentId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("child_profiles")
    .select("*")
    .eq("parent_id", parentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return data ?? null;
}

// ── Consent ────────────────────────────────────────────────────

export async function saveConsent(parentId: string, parentName: string) {
  const supabase = createClient();

  // Check if consent already exists
  const { data: existing } = await supabase
    .from("consents")
    .select("id")
    .eq("parent_id", parentId)
    .single();

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from("consents")
      .update({ parent_name: parentName, given: true, given_at: new Date().toISOString() })
      .eq("parent_id", parentId);
    if (error) { console.error("saveConsent update error:", error); throw error; }
  } else {
    // Insert new record
    const { error } = await supabase.from("consents").insert({
      parent_id: parentId,
      parent_name: parentName,
      given: true,
      given_at: new Date().toISOString(),
    });
    if (error) { console.error("saveConsent insert error:", error); throw error; }
  }
}

export async function hasConsent(parentId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("consents")
    .select("given")
    .eq("parent_id", parentId)
    .single();
  return data?.given ?? false;
}

// ── Sessions ───────────────────────────────────────────────────

export async function startSession(
  childId: string,
  parentId: string,
  totalPrompts: number
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      child_id: childId,
      parent_id: parentId,
      total_prompts: totalPrompts,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function endSession(
  sessionId: string,
  promptsCompleted: number,
  startedAt: string
) {
  const supabase = createClient();
  const endedAt = new Date().toISOString();
  const durationSeconds = Math.round(
    (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000
  );

  const { error } = await supabase
    .from("sessions")
    .update({
      ended_at: endedAt,
      duration_seconds: durationSeconds,
      prompts_completed: promptsCompleted,
      completed: true,
    })
    .eq("id", sessionId);

  if (error) throw error;
}

export async function saveSessionScores(
  sessionId: string,
  scores: SessionScore
) {
  const supabase = createClient();
  const { error } = await supabase.from("session_scores").insert({
    session_id: sessionId,
    pronunciation: scores.pronunciation,
    fluency: scores.fluency,
    articulation: scores.articulation,
    confidence: scores.confidence,
  });
  if (error) throw error;
}

export async function saveFeedbackEvents(
  sessionId: string,
  events: FeedbackChip[]
) {
  const supabase = createClient();
  const rows = events.map((e, i) => ({
    session_id: sessionId,
    type: e.type,
    message: e.message,
    prompt_index: i,
  }));
  const { error } = await supabase.from("feedback_events").insert(rows);
  if (error) throw error;
}

export async function saveRecommendation(
  sessionId: string,
  childId: string,
  weakestArea: string,
  drillText: string
) {
  const supabase = createClient();
  const { error } = await supabase.from("practice_recommendations").insert({
    session_id: sessionId,
    child_id: childId,
    weakest_area: weakestArea,
    drill_text: drillText,
  });
  if (error) throw error;
}

// ── Dashboard ──────────────────────────────────────────────────

export async function getWeekHistory(childId: string) {
  const supabase = createClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const { data, error } = await supabase
    .from("sessions")
    .select(`
      id,
      started_at,
      completed,
      prompts_completed,
      total_prompts,
      session_scores (overall)
    `)
    .eq("child_id", childId)
    .eq("completed", true)
    .gte("started_at", sevenDaysAgo.toISOString())
    .order("started_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getLatestSession(childId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(`
      id,
      started_at,
      prompts_completed,
      total_prompts,
      session_scores (pronunciation, fluency, articulation, confidence, overall),
      feedback_events (type, message),
      practice_recommendations (weakest_area, drill_text)
    `)
    .eq("child_id", childId)
    .eq("completed", true)
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
}
