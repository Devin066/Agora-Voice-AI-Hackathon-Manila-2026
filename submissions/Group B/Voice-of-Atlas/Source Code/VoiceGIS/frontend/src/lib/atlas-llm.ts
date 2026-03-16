/**
 * Shared config for Atlas conversational AI.
 * Used by:
 * - Chat mode: /api/chat (OpenRouter or local Ollama)
 * - Voice mode: Agora Conversational AI join config (ASR → LLM → TTS) — uses OpenRouter (cloud must reach LLM)
 *
 * Local LLM (Ollama): set USE_LOCAL_LLM=true and run `ollama run gemma3:4b`. Unlimited, no quota.
 * Gemma 3 4B is quantized (~3.3GB), single-file, MacBook Air friendly.
 */

export const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const OPENROUTER_MODEL = 'google/gemma-3n-e4b-it:free';

/** Default for local Ollama (Gemma 3 4B IT quantized, light for MacBook Air). */
export const LOCAL_OLLAMA_URL = 'http://localhost:11434/v1/chat/completions';
export const LOCAL_OLLAMA_MODEL = 'gemma3:4b';

/** @deprecated Use OPENROUTER_MODEL or getChatConfig().model */
export const MODEL = OPENROUTER_MODEL;

/** Context injected for Atlas (system or first user message depending on provider). */
export const ATLAS_CONTEXT =
  '[Context: You are Atlas, a map assistant. When the user asks to zoom in/out or other map actions, the app runs those commands automatically. Reply briefly confirming what was done (e.g. "Zoomed in by 5%.") and do not say you cannot control the map.]';

export type ChatConfig = {
  url: string;
  model: string;
  apiKey: string | null;
  useSystemRole: boolean;
};

/** Resolves chat URL, model, and auth from env. Use for /api/chat and (when reachable) Agora agent. */
export function getChatConfig(): ChatConfig {
  const useLocal = process.env.USE_LOCAL_LLM === 'true';
  if (useLocal) {
    return {
      url: (process.env.LOCAL_LLM_URL || LOCAL_OLLAMA_URL).trim(),
      model: (process.env.LOCAL_LLM_MODEL || LOCAL_OLLAMA_MODEL).trim(),
      apiKey: null,
      useSystemRole: true,
    };
  }
  return {
    url: OPENROUTER_CHAT_URL,
    model: OPENROUTER_MODEL,
    apiKey: process.env.OPENROUTER_API_KEY?.trim() || null,
    useSystemRole: false,
  };
}
