# BACKEND.md — Voice AI Study Buddy
# Python Backend — Architecture, Modules & Conventions
# Reference this before building any backend module, endpoint, or AI service.

---

## What the Backend Owns

The React frontend handles display only. The Python backend owns everything else:

```
┌─────────────────────────────────────────────────────────────────┐
│                        PYTHON BACKEND                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  API Layer   │  │  AI Engine   │  │   Voice Services     │  │
│  │  (FastAPI)   │  │  (Prompts,   │  │   (STT / TTS)        │  │
│  │              │  │   Sessions,  │  │                      │  │
│  │  REST + WS   │  │   Context)   │  │   Whisper + OpenAI   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Document    │  │  Progress    │  │   User & Settings    │  │
│  │  Parser      │  │  Tracker     │  │   Store              │  │
│  │              │  │              │  │                      │  │
│  │  PDF/DOCX    │  │  Gaps, Scores│  │   Tutor prefs,       │  │
│  │  extraction  │  │  Streaks     │  │   session history    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                        ┌─────┴─────┐
                        │  Database │
                        │ (Postgres │
                        │  or SQLite│
                        │  for dev) │
                        └───────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI |
| Language | Python 3.11+ |
| AI / LLM | OpenAI API (GPT-4o for conversation, Whisper for STT, TTS for voice) |
| Document Parsing | PyMuPDF (PDF), python-docx (DOCX), openpyxl (XLSX) |
| Database | PostgreSQL (production), SQLite (local dev) |
| ORM | SQLAlchemy (async) |
| Auth | JWT (access + refresh tokens) |
| File Storage | Local filesystem (dev), S3-compatible (production) |
| WebSocket | FastAPI native WebSocket (for real-time session streaming) |
| Task Queue | Celery + Redis (for async document parsing) |

---

## Folder Structure

```
backend/
├── main.py                    ← FastAPI app entry point
├── config.py                  ← Env vars, settings (pydantic BaseSettings)
│
├── api/
│   ├── routes/
│   │   ├── auth.py            ← Login, register, refresh token
│   │   ├── sessions.py        ← Start/end session, session history
│   │   ├── documents.py       ← Upload, list, delete documents
│   │   ├── progress.py        ← Stats, charts data, knowledge gaps
│   │   ├── settings.py        ← Get/save tutor persona settings
│   │   └── ws/
│   │       └── session_ws.py  ← WebSocket: real-time voice session stream
│   └── deps.py                ← Shared dependencies (DB session, current user)
│
├── services/
│   ├── ai/
│   │   ├── session_manager.py ← Conversation state, turn management
│   │   ├── prompt_builder.py  ← Assembles system prompt from user settings
│   │   ├── evaluator.py       ← Scores student explanation quality
│   │   └── gap_detector.py    ← Identifies knowledge gaps from session
│   ├── voice/
│   │   ├── stt.py             ← Speech-to-text (Whisper)
│   │   └── tts.py             ← Text-to-speech (OpenAI TTS)
│   ├── documents/
│   │   ├── parser.py          ← Routes to correct parser by file type
│   │   ├── pdf_parser.py
│   │   ├── docx_parser.py
│   │   └── chunker.py         ← Splits parsed text into AI-digestible chunks
│   └── progress/
│       ├── tracker.py         ← Records session events, scores
│       ├── aggregator.py      ← Computes weekly stats, trend data
│       └── streak.py          ← Manages study streak logic
│
├── models/
│   ├── user.py
│   ├── session.py
│   ├── document.py
│   ├── progress.py
│   └── settings.py
│
├── schemas/
│   ├── session.py             ← Pydantic request/response schemas
│   ├── document.py
│   ├── progress.py
│   └── settings.py
│
└── db/
    ├── base.py                ← SQLAlchemy base
    ├── session.py             ← Async DB session factory
    └── migrations/            ← Alembic migrations
```

---

## API Endpoints

### Auth
```
POST   /auth/register          Body: { email, password, name }
POST   /auth/login             Body: { email, password } → { access_token, refresh_token }
POST   /auth/refresh           Body: { refresh_token } → { access_token }
POST   /auth/logout
```

### Sessions
```
POST   /sessions/start         Body: { topic_id? } → { session_id }
POST   /sessions/{id}/end      → saves session, triggers progress update
GET    /sessions/{id}          → session detail + transcript summary
GET    /sessions               → list of past sessions (paginated)
WS     /ws/session/{id}        ← real-time session stream (see WebSocket spec below)
```

### Documents
```
POST   /documents/upload       Multipart form: file + session_id
                               → { document_id, status: "processing" }
                               Called by the frontend after a file is sent in a Voice Session.
                               Not triggered from the Documents page — that page is read-only.
GET    /documents              → list of user's documents (with session_date, file_type, status)
DELETE /documents/{id}         → removes file and AI context reference
GET    /documents/{id}/status  → { status: "processing" | "ready" | "unavailable" }
```

### Progress
```
GET    /progress/stats         → { totalStudyTime, averageScore, topicsMastered, areasToReview }
GET    /progress/weekly        → { days: [{ day, minutes, score }] }
GET    /progress/topics        → [{ topic, proficiency, questionsAnswered }]
GET    /progress/gaps          → [{ topic, category, proficiency }] sorted by proficiency asc
```

### Settings
```
GET    /settings               → TutorSettings { name, voice, teachingStyle }
PATCH  /settings               Body: Partial<TutorSettings> → updated settings
```

---

## WebSocket: Real-Time Session (`/ws/session/{id}`)

This is the most critical backend component. All AI interaction flows through this socket.

### Message Types (Client → Server)
```json
{ "type": "audio_chunk", "data": "<base64 audio>" }
{ "type": "text_input",  "text": "What is the mechanism of loop diuretics?" }
{ "type": "mode_change", "mode": "direct_qa" | "interactive" }
{ "type": "session_end" }
```

### Message Types (Server → Client)
```json
{ "type": "transcript",    "text": "...",   "role": "student" }
{ "type": "ai_response",   "text": "...",   "role": "ai",  "is_final": false }
{ "type": "ai_response",   "text": "...",   "role": "ai",  "is_final": true }
{ "type": "audio_response","data": "<base64 audio>",       "voice": "alloy" }
{ "type": "status",        "state": "listening" | "thinking" | "speaking" }
{ "type": "session_summary","topics": [], "strengths": [], "review": [] }
{ "type": "error",         "code": "...",  "message": "..." }
```

### Session Flow
```
1. Client connects → server loads session context (user settings, documents, history)
2. Client sends audio_chunk (streaming) or text_input
3. Server:
   a. STT: transcribe audio → text (if audio input)
   b. Emit transcript back to client
   c. Build prompt (prompt_builder.py) using tutor settings + context
   d. Stream LLM response (GPT-4o streaming)
   e. Emit ai_response chunks as they stream
   f. TTS: convert final response to audio
   g. Emit audio_response
4. On session_end:
   a. Save session transcript
   b. Run gap_detector.py on session
   c. Update progress tracker
   d. Emit session_summary
   e. Close connection
```

---

## AI Services

### `prompt_builder.py` — System Prompt Assembly

This is where user settings become AI behavior. Called at session start.

```python
def build_system_prompt(
    tutor_name: str,
    voice: str,
    teaching_style: str,
    exam_type: str,
    student_name: str,
    document_chunks: list[str],
    weak_areas: list[str],
    session_mode: str,
) -> str:
    """
    Assembles the full system prompt from components.
    Order matters — role first, then context, then constraints, then format.
    """
```

**Prompt structure:**
```
[ROLE]
You are {tutor_name}, a Voice AI Study Companion helping {student_name}
prepare for the {exam_type} board exam.

[TEACHING STYLE — injected based on setting]
  encouraging: "You are warm and supportive. Always acknowledge what the student
                got right before addressing gaps. Celebrate progress."
  challenging:  "You push the student to think deeper. Ask follow-up questions
                that require them to apply, not just recall, concepts."
  neutral:      "You are balanced and objective. Give clear, accurate feedback
                without excessive praise or pressure."

[CONTEXT]
The student has uploaded the following study materials:
{document_chunks — top N most relevant, retrieved by semantic similarity}

Known weak areas from previous sessions:
{weak_areas}

[CONSTRAINTS]
- Stay within the domain of {exam_type} board exam content
- One question at a time in interactive mode
- Acknowledge correct elements before correcting errors
- Voice-optimized output: short sentences, no markdown, no bullet points
- Do not provide personal, medical, or legal advice — exam knowledge only

[SESSION MODE]
{mode-specific instruction — see session_manager.py}

[OUTPUT FORMAT]
Plain spoken language. No markdown. No bullet points.
Short sentences suited for text-to-speech conversion.
```

---

### `session_manager.py` — Conversation State

```python
class SessionManager:
    """
    Manages turn-by-turn conversation state for a single session.
    Maintains: message history, current mode, context window budget.
    """
    def add_turn(self, role: str, content: str) -> None
    def get_context_window(self, max_tokens: int = 8000) -> list[dict]
    def switch_mode(self, mode: Literal["direct_qa", "interactive"]) -> None
    def get_mode_instruction(self) -> str
```

Context window management: older turns are summarized, not dropped, to preserve
learning continuity within a session.

---

### `evaluator.py` — Student Explanation Scoring

Called after each student turn in interactive mode.

```python
def evaluate_explanation(
    student_text: str,
    concept: str,
    expected_elements: list[str],
) -> EvaluationResult:
    """
    Scores the student's verbal explanation.
    Returns: accuracy score, completeness score, missing_elements, correct_elements
    """

class EvaluationResult:
    accuracy: float        # 0.0 – 1.0
    completeness: float    # 0.0 – 1.0
    correct_elements: list[str]
    missing_elements: list[str]
    feedback_hint: str     # used to guide the AI's next response
```

---

### `gap_detector.py` — Knowledge Gap Analysis

Called at session end. Analyzes the full session to update the student's gap profile.

```python
def detect_gaps(
    session_transcript: list[dict],
    topic: str,
) -> list[KnowledgeGap]:
    """
    Scans the session for patterns: repeated errors, hesitations, incorrect answers.
    Updates the student's gap profile for this topic.
    """
```

---

## Document Pipeline

Files are not uploaded from a standalone page — they are attached during a Voice Session
via the [+] button and sent alongside the student's prompt. The frontend calls
`POST /documents/upload` with the file and the current `session_id` immediately after send.

```
Student attaches file in Voice Session
  └── Attachment queued in UI (AttachmentPreviewChip)
  └── On prompt send: frontend calls POST /documents/upload (file + session_id)
  └── Backend:
        Save raw file to storage
        Record session_id → used as "Shared in session" metadata on Documents page
        Emit { status: "processing" }
        Queue Celery task: parse_document.delay(document_id)

Celery Task: parse_document
  └── Route to parser by file type:
        PDF   → pdf_parser.py   (PyMuPDF)
        DOCX  → docx_parser.py  (python-docx)
        TXT   → read directly
        XLSX  → openpyxl
        Image → store as-is (passed to vision-capable model if needed)
  └── Extract text (non-image formats)
  └── chunker.py: split into ~500 token chunks
  └── Save chunks to DB with document_id + session_id reference
  └── Update document status → "ready"
  └── (Future: embed chunks for semantic retrieval)

Documents page (GET /documents):
  └── Returns all documents for this user, sorted by session_date desc
  └── Read-only — no upload logic on the Documents page
```

---

## Progress Tracking

### Events recorded per session turn:
- `concept_explained_correctly` — topic, concept, score
- `concept_explained_incorrectly` — topic, concept, gap details
- `question_answered` — question text, correct/incorrect
- `session_duration` — minutes
- `mode_used` — direct_qa / interactive

### Computed metrics (aggregator.py):
- **Study Time** — sum of session_duration per day/week
- **Average Score** — mean of question answer scores
- **Topics Mastered** — topics where average accuracy ≥ 80% over last 5 sessions
- **Knowledge Gaps** — topics/concepts with accuracy < 50% in last 3 sessions
- **Study Streak** — consecutive days with ≥ 1 completed session

---

## Backend Conventions

| Convention | Rule |
|---|---|
| All routes return typed Pydantic schemas | No raw dict returns |
| No AI prompt strings in route files | All prompts in `services/ai/prompt_builder.py` |
| No file I/O in route handlers | Delegate to `services/documents/` |
| No direct DB queries in services | Services use repository pattern via models |
| All endpoints require auth | Use `Depends(get_current_user)` — no public AI endpoints |
| Async everywhere | All DB calls, AI calls, file I/O must be async |
| Environment variables via config.py | Never hardcode API keys or DB strings |
| Errors return typed error responses | `{ "error": { "code": "...", "message": "..." } }` |

---

## Environment Variables (config.py)

```python
class Settings(BaseSettings):
    OPENAI_API_KEY: str
    DATABASE_URL: str
    REDIS_URL: str
    FILE_STORAGE_PATH: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    MAX_DOCUMENT_SIZE_MB: int = 20
    ALLOWED_FILE_TYPES: list[str] = ["pdf", "doc", "docx", "txt", "xls", "xlsx", "csv"]
    LLM_MODEL: str = "gpt-4o"
    STT_MODEL: str = "whisper-1"
    TTS_MODEL: str = "tts-1"
```

---

## Done When (Backend)

- [ ] FastAPI app starts and all routes are registered
- [ ] Auth: register, login, refresh, logout all work
- [ ] JWT middleware protects all non-auth routes
- [ ] Document upload: file saved, Celery task queued, status returned
- [ ] Document parsing: all 5 formats (PDF, DOCX, TXT, XLS, XLSX) parse correctly
- [ ] WebSocket session: connects, receives audio, returns transcript + AI response + audio
- [ ] prompt_builder.py assembles system prompt correctly from all settings inputs
- [ ] Teaching style injects correct behavior modifier into system prompt
- [ ] Tutor name appears in system prompt
- [ ] Session evaluator scores student explanations
- [ ] Gap detector updates knowledge gap profile at session end
- [ ] Progress aggregator returns correct weekly stats
- [ ] Study streak increments on daily session completion
- [ ] Settings GET and PATCH persist to DB
- [ ] All routes return Pydantic-typed responses (no raw dicts)
