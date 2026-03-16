# Backend Contract (Locked)

This service provides a stable session lifecycle contract for the mobile app.

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
  "agoraConfigured": true,
  "activeSessions": 1
}
```

### `POST /api/v1/session`

Create a session and issue an Agora RTC token.

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
  "expiresInSeconds": 7200
}
```

### `POST /api/v1/start`

Mark a created session as active and attach optional agent settings.

Request body:

```json
{
  "sessionId": "0af8e65a-8df0-4fd1-9022-773f9ea3fdf0",
  "agentConfig": {
    "locale": "en-PH",
    "voiceStyle": "assistant"
  }
}
```

Success response (`200`):

```json
{
  "sessionId": "0af8e65a-8df0-4fd1-9022-773f9ea3fdf0",
  "channelName": "cook-room-a",
  "status": "active",
  "startedAt": "2026-03-16T10:16:12.110Z"
}
```

### `POST /api/v1/end`

End and cleanup a session.

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
  "endedAt": "2026-03-16T10:25:07.452Z"
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
- `INTERNAL_ERROR`

## Environment variables

See `.env.example`.

Required:

- `AGORA_APP_ID`
- `AGORA_APP_CERTIFICATE`

Optional:

- `PORT` (default `3000`)
- `SESSION_TTL_MINUTES` (default `120`)
