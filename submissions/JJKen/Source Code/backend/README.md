# Backend Contract (Locked)

This service provides a stable real-time voice session lifecycle contract for the mobile app.

## Base URL

- Versioned: `/api/v1`
- Compatibility aliases (same behavior): `/session`, `/start`, `/end`

## Endpoints

### `GET /health`

Demo safety endpoint.

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-03-16T10:15:30.123Z",
  "service": "backend",
  "uptimeSeconds": 512,
  "agoraRtcConfigured": true,
  "agoraConvoAiConfigured": true,
  "activeSessions": 1
}
```

### `POST /api/v1/session`

Create a session and issue an Agora RTC token for user channel join.

Request body:

```json
{
  "userId": "user-123",
  "channelName": "cook-room-a"
}
```

Success response (`201`):

```json
{
  "sessionId": "0af8e65a-8df0-4fd1-9022-773f9ea3fdf0",
  "userId": "user-123",
  "channelName": "cook-room-a",
  "uid": 123456789,
  "token": "<agora-rtc-token>",
  "status": "created",
  "expiresInSeconds": 7200,
  "flow": {
    "rtc": "token_issued",
    "conversationalAi": "awaiting_start"
  }
}
```

### `POST /api/v1/start`

Start Agora Conversational AI for the same RTC channel so the user can speak and receive AI voice responses.

Request body:

```json
{
  "sessionId": "0af8e65a-8df0-4fd1-9022-773f9ea3fdf0",
  "agentConfig": {
    "name": "cook-assistant",
    "prompt": "You are a helpful real-time cooking assistant."
  }
}
```

Success response (`200`):

```json
{
  "sessionId": "0af8e65a-8df0-4fd1-9022-773f9ea3fdf0",
  "channelName": "cook-room-a",
  "status": "active",
  "startedAt": "2026-03-16T10:16:12.110Z",
  "flow": {
    "rtc": {
      "channelName": "cook-room-a",
      "uid": 123456789
    },
    "conversationalAi": {
      "state": "joined",
      "agentSessionId": "agent-session-id"
    }
  }
}
```

### `POST /api/v1/end`

Stop Conversational AI and cleanup the session.

Request body:

```json
{
  "sessionId": "0af8e65a-8df0-4fd1-9022-773f9ea3fdf0"
}
```

Success response (`200`):

```json
{
  "sessionId": "0af8e65a-8df0-4fd1-9022-773f9ea3fdf0",
  "status": "terminated",
  "endedAt": "2026-03-16T10:25:07.452Z",
  "flow": {
    "rtc": "left_channel",
    "conversationalAi": "left_channel"
  }
}
```

## Error format

All errors use this structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "sessionId is required"
  }
}
```

Common error codes:

- `VALIDATION_ERROR`
- `CONFIG_ERROR`
- `SESSION_NOT_FOUND`
- `INVALID_STATE`
- `CONVO_AI_START_FAILED`
- `CONVO_AI_STOP_FAILED`
- `INTERNAL_ERROR`

## Environment variables

See `.env.example`.

Required:

- `AGORA_APP_ID`
- `AGORA_APP_CERTIFICATE`
- `AGORA_CUSTOMER_ID`
- `AGORA_CUSTOMER_SECRET`

Use real credential values for required keys. Placeholder values (for example values containing `your-`, `example`, or `placeholder`) are treated as not configured.

Optional:

- `PORT` (default `3000`)
- `SESSION_TTL_MINUTES` (default `120`)
- `CONVO_AI_TIMEOUT_MS` (default `10000`)
- `CONVO_AI_RETRIES` (default `1`)
- `AGORA_CONVO_AI_BASE_URL` (default `https://api.agora.io`)
- `AGORA_CONVO_AI_START_PATH` (default `/api/conversational-ai-agent/v2/projects/{appId}/join`)
- `AGORA_CONVO_AI_STOP_PATH` (default `/api/conversational-ai-agent/v2/projects/{appId}/agents/{agentId}/leave`)
- `DEFAULT_ASSISTANT_NAME` (default `cook-assistant`)
- `DEFAULT_ASSISTANT_PROMPT` (default `You are a helpful real-time cooking assistant.`)
- `DEFAULT_TTS_ADDON` (default empty; required unless `agentConfig.properties.tts.addon` is provided on `/start`)
