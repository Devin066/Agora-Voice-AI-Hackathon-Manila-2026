
# VisionVoice - Agora ConvoAI Configuration Guide

To make the agent work correctly with VisionVoice, configure **Agora Console** >
**Conversational AI** > **Agent Settings** with the following values.

## 1. LLM Settings

- **Provider**: `Gemini`
- **Recommended model**: `gemini-2.5-flash-lite`
- **Fallback model**: `gemini-2.5-flash`
- **Avoid**: `gemini-2.0-flash-lite`
  Official Gemini docs mark it as deprecated and recommend migrating to
  `gemini-2.5-flash-lite`.
- **Free-tier note**:
  `gemini-2.5-flash-lite` currently appears to be the best free-tier choice for
  low-latency, high-frequency usage. Public summaries commonly cite about
  `15 RPM` and `1000 RPD`, but Google states the authoritative limits are the
  ones shown in your own AI Studio rate-limit page because limits can vary by
  project and tier.

### System Prompt

```text
You are VisionVoice, an assistive smart-glasses AI for visually impaired users.
You receive scene descriptions from the user's camera and spoken questions from the user.

Your job is to provide short, calm, practical guidance.

Rules:
1. Keep responses under 2 short sentences unless the user explicitly asks for more.
2. If the visual context contains "Caution", warn the user immediately and clearly.
3. Only mention objects or hazards that are present in the provided context.
4. If the user asks what is around them, summarize the scene in simple words.
5. If context is empty or unclear, say the path looks clear or that you need a better view.
6. If the user asks for help or emergency support, acknowledge and mention caregiver escalation if available.
7. Never invent faces, objects, distances, or hazards that were not provided.
```

## 2. TTS Settings

- **Vendor**: your enabled Agora-supported TTS provider
- **Low-latency recommendation**: choose the fastest voice first, then tune style later
- **Voice style**: calm, neutral, assistive

If you are using ElevenLabs, a low-latency turbo voice is still a good fit for
the demo.

## 3. Realtime Behavior

- **Greeting**: `VisionVoice active. I am ready.`
- **Failure message**: `I am having trouble connecting. Please wait.`
- **VAD silence timeout**: `800ms` to `1200ms`
- **Interruptible**: `True`
- **Response style**: short, spoken, practical

## 4. Secrets and Credentials

- Put the **Gemini API key** only inside the Agora ConvoAI provider configuration.
- Do **not** place your Gemini key in the frontend source code.
- Do **not** place the Agora primary or secondary certificate in the frontend.
- The **Agora certificates** are only for token generation or backend-side secure operations.
- The frontend should only use:
  - `VITE_AGORA_APP_ID`
  - `VITE_AGORA_CHANNEL`
  - `VITE_AGORA_TOKEN`

## 5. What The Frontend Already Uses

The current VisionVoice frontend already uses Agora RTC for:

- microphone publish
- camera track creation and local preview
- optional caregiver video publish
- remote audio playback from the agent
- RTC join via App ID, channel, and token

Important detail:

- The camera is created through Agora live media tracks now.
- The camera is **previewed locally immediately**.
- The camera is **only streamed to others when "Start caregiver call" is pressed**.

## 6. Data Stream Note

The frontend sends scene context over **Agora RTC data stream** when available.

If your agent only reacts to voice and does not answer based on vision context,
the missing piece is usually not the frontend. The agent/backend side must read
the incoming text context and inject it into the LLM prompt before generating
the spoken response.
