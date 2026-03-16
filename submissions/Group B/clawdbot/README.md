Multi-school (multi-tenant) demo platform for school document requests + OCR + AI assistant (Gemini optional) + voice room (Agora optional).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Demo Flow (In-Memory Backend)

- Go to `/`
- Pick a school (tenant) or create one
- Use "Demo login" to sign in as `student`, `teacher`, or `school_admin`
- Open the tenant dashboard at `/s/[schoolId]`
- Request documents at `/s/[schoolId]/documents`
- Track requests at `/s/[schoolId]/requests`
- Run OCR uploads at `/s/[schoolId]/upload`
- Chat with the assistant at `/s/[schoolId]/assistant`
- Admin pages:
  - Requests: `/s/[schoolId]/admin/requests`
  - Audit: `/s/[schoolId]/admin/audit`

## Environment Variables

- Supabase (optional; currently not used by the demo store):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_KEY`
- Gemini (optional, for `/api/ai/chat`):
  - `GEMINI_API_KEY` (server-side)
- Agora voice (optional):
  - `NEXT_PUBLIC_AGORA_APP_ID` (client-side)

## Supabase Backend

The current implementation uses an in-memory store for hackathon-friendly local development. The next step is adding a Supabase schema + RLS and switching the API routes to use Supabase. See `CODEX_PROMPT.md`.

## Notes

- This is a demo auth flow (HttpOnly cookies set by `/api/auth/login`). Don’t ship as-is.
- The OCR validation check is a simple heuristic (looks for name/email tokens).
