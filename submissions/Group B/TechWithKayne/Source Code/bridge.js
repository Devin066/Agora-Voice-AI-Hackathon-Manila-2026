// bridge.js — Supabase-backed bridge session manager

const { supabase } = require("./middleware/auth");

const BRIDGE_CHANNEL = "ugnayai-emergency-bridge";

/**
 * Opens a new bridge session in Supabase.
 * @param {string} bhwId — UUID of the BHW triggering the bridge
 * @returns {Promise<{ active: boolean, channel: string, triggeredAt: string }>}
 */
async function triggerBridge(bhwId) {
  const { data, error } = await supabase
    .from("bridge_sessions")
    .insert({ channel: BRIDGE_CHANNEL, bhw_id: bhwId })
    .select()
    .single();

  if (error) throw new Error(`Bridge trigger failed: ${error.message}`);

  console.log(`[BRIDGE] Emergency bridge triggered → channel: ${BRIDGE_CHANNEL}`);
  return {
    active:      true,
    channel:     data.channel,
    triggeredAt: data.triggered_at,
  };
}

/**
 * Returns the most recent active bridge session, or a falsy status object.
 * @returns {Promise<{ active: boolean, channel: string|null, triggeredAt: string|null }>}
 */
async function getBridgeStatus() {
  const { data } = await supabase
    .from("bridge_sessions")
    .select("channel, triggered_at")
    .is("ended_at", null)
    .order("triggered_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return { active: false, channel: null, triggeredAt: null };
  return { active: true, channel: data.channel, triggeredAt: data.triggered_at };
}

/**
 * Ends all active bridge sessions, recording the nurse who ended it.
 * @param {string} [nurseId] — UUID of the nurse ending the session
 */
async function resetBridge(nurseId) {
  await supabase
    .from("bridge_sessions")
    .update({ ended_at: new Date().toISOString(), nurse_id: nurseId || null })
    .is("ended_at", null);

  console.log("[BRIDGE] Bridge session reset.");
}

module.exports = { triggerBridge, getBridgeStatus, resetBridge, BRIDGE_CHANNEL };
