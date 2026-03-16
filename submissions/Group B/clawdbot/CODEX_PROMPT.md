# Clawdbot: Multi-School AI Document Platform (Codex Prompt)

## Goal
Turn this repo into a reusable SaaS-style platform for any school:
- Multi-tenant: each school is isolated by `schoolId`
- Roles: `school_admin`, `teacher`, `student`
- Document library + request workflow
- OCR uploads + validation
- AI assistant (Gemini) and optional voice via Agora
- Audit logging

## Current State (2026-03-16)
- Next.js App Router.
- Demo backend is an in-memory store with seed data in `lib/server/store.ts`.
- API routes exist for:
  - `GET/POST /api/schools`
  - `GET /api/schools/[schoolId]`
  - `GET/POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
  - `GET/POST /api/schools/[schoolId]/document-types`
  - `GET/POST/PATCH /api/schools/[schoolId]/requests`
  - `POST /api/schools/[schoolId]/uploads`
  - `POST /api/ai/chat`
  - `GET /api/audit?schoolId=...`
- Tenant UI routes exist under `/s/[schoolId]/...`.

## What To Build Next (Supabase Backend)
Replace the in-memory store with Supabase (Postgres) while keeping the same API surface.

### 1. Schema (SQL)
Create tables:
- `schools`:
  - `id text primary key`
  - `name text not null`
  - `domain text null`
  - `branding jsonb null`
  - `created_at timestamptz not null default now()`
- `users`:
  - `id uuid primary key default gen_random_uuid()`
  - `school_id text not null references schools(id) on delete cascade`
  - `email text not null`
  - `name text not null`
  - `role text not null check (role in ('school_admin','teacher','student'))`
  - `created_at timestamptz not null default now()`
  - unique `(school_id, email)`
- `document_types`:
  - `id uuid primary key default gen_random_uuid()`
  - `school_id text not null references schools(id) on delete cascade`
  - `name text not null`
  - `description text null`
  - `requires_upload boolean not null default false`
  - `created_at timestamptz not null default now()`
- `requests`:
  - `id uuid primary key default gen_random_uuid()`
  - `school_id text not null references schools(id) on delete cascade`
  - `student_id uuid not null references users(id) on delete cascade`
  - `document_type_id uuid not null references document_types(id)`
  - `status text not null check (status in ('pending','processing','ready','rejected','cancelled'))`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
- `uploads`:
  - `id uuid primary key default gen_random_uuid()`
  - `school_id text not null references schools(id) on delete cascade`
  - `request_id uuid not null references requests(id) on delete cascade`
  - `ocr_text text not null`
  - `validation_status text not null check (validation_status in ('unverified','passed','failed'))`
  - `created_at timestamptz not null default now()`
- `chat_logs` (optional for MVP):
  - `id uuid primary key default gen_random_uuid()`
  - `school_id text not null references schools(id) on delete cascade`
  - `user_id uuid not null references users(id) on delete cascade`
  - `messages jsonb not null`
  - `created_at timestamptz not null default now()`
- `audit_logs`:
  - `id uuid primary key default gen_random_uuid()`
  - `school_id text null references schools(id) on delete cascade`
  - `actor_user_id uuid null references users(id) on delete set null`
  - `action text not null`
  - `metadata jsonb null`
  - `at timestamptz not null default now()`

### 2. RLS (Row Level Security)
Enable RLS and enforce tenant isolation by `school_id`.
Recommended approach:
- Use Supabase Auth users and a `profiles/users` table, where `school_id` and `role` are claims or are looked up server-side.
- For hackathon demo, it’s acceptable to use server-side Supabase with a service role key and enforce access in route handlers.

### 3. Data Access Layer
Implement a db adapter with an interface similar to:
- `listSchools()`
- `getSchool(schoolId)`
- `upsertUser({schoolId,email,name,role})`
- `listDocumentTypes(schoolId)`
- `createRequest({schoolId,studentId,documentTypeId})`
- `listRequests({schoolId, viewerUser})`
- `updateRequestStatus({schoolId, requestId, status, viewerUser})`
- `createUpload({schoolId, requestId, ocrText, viewerUser})`
- `writeAudit(...)`

Then flip API routes to call the adapter instead of the in-memory store.

### 4. Environment
Use:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_KEY` (anon)
- `SUPABASE_SERVICE_ROLE_KEY` (server-side, if using service role)

## Acceptance Checks
- Tenant isolation: user in `schoolId=A` cannot read/write `schoolId=B`.
- Student can only view/cancel own requests.
- Admin can list and update all requests within tenant.
- OCR upload records an upload + audit row.
- `/api/ai/chat` logs an audit entry.

