# PROJECT.md — Voice AI Study Buddy
# REVISED — UI-confirmed from design screens

> Status: Active Development
> Maintained by: Lead Developer
> Last updated: 2025

---

## What This Is

**Voice AI Study Buddy** (branded as **Study Buddy — Voice AI Tutor**) is a voice-based AI
study companion designed to help students prepare for board and licensure exams in the Philippines.
It simulates a personal tutor through voice and video interaction, active recall sessions,
and structured progress tracking — at a fraction of the cost of a review center.

> The AI companion is fully customizable: students set their tutor's name (default: "Nova")
> and select a voice persona and teaching style. Design references may use **GABAY** as the
> default companion name — this may serve as the product alias or suggested companion name.

---

## The Problem We're Solving

| Pain Point | Reality |
|---|---|
| Review center fees | ₱6,000 – ₱20,000+ per program |
| Living expenses during review | ₱50,000 – ₱70,000 for 4–5 months |
| Studying alone | No feedback, no accountability, no guidance |
| Generic study tools | One-size-fits-all; not adaptive to the student |

---

## Target Users

**Primary:** Board exam takers and licensure exam candidates in the Philippines.

**Especially:**
- Students who cannot afford review centers
- Self-studying students who need structured, personalized feedback
- Learners who retain information better through verbal explanation (active recall)

---

## Application Structure (Confirmed from UI)

Single-page web application. Persistent **left sidebar** navigation + **main content panel**
that swaps per route.

### Routes / Pages

| Route | Page | Purpose |
|---|---|---|
| `/dashboard` | Dashboard | Overview, stats, quick session, topics, review areas |
| `/voice-session` | Voice Session | AI tutor session in video or voice chat mode |
| `/documents` | Documents | Upload and manage study materials |
| `/progress` | Progress Tracking | Charts, proficiency breakdown, knowledge gaps |
| `/settings` | Settings | Tutor persona, voice, teaching style, preferences |

### Sidebar (Persistent)
- Logo area: "Study Buddy / Voice AI Tutor" with icon
- Nav items: Dashboard · Voice Session · Documents · Progress · Settings
- Bottom: Study Streak card (e.g., "7 Days — Keep it up!")
- Active state: white text on filled gradient pill
- Background: dark purple gradient (#1f0b47 → #2e1065 → #0f0529)

---

## Key Features (UI-Confirmed)

### Dashboard
- 4 stat cards: Study Time · Average Score · Topics Reviewed · Sessions
  - Each card shows: label, large value, context subtext, green delta vs last week
- Quick Voice Session panel — mic button, "AI Ready" badge, "Active recall mode enabled"
- Your Topics grid — enrolled topic cards with proficiency progress bars
- Areas to Review panel — ranked list of low-proficiency topics with percentage scores

### Voice Session — Dual Mode
Toggle tab at top of the view: **VIDEO CHAT** | **VOICE CHAT**

| Mode | Visual | Behavior |
|---|---|---|
| **Video Chat** | AI tutor video feed (full or split with student camera) | Face-to-face tutor experience |
| **Voice Chat** | Animated mic pulse visualization (concentric circles) | Audio-only; visual focus on mic state |

Controls: Camera toggle · End call (red) · Microphone toggle
Text prompt bar at the bottom for typed input in both modes.

### Documents
- Drag-and-drop upload zone with dashed border
- "+ Select Files" button (gradient fill)
- Supported: PDF, DOC, DOCX, TXT, XLS, XLSX, CSV
- Document list below with file cards
- Empty state: "No documents yet / Upload your first document to get started"

### Progress Tracking
- 4 stat cards: Total Study Time · Average Score · Topics Mastered · Areas to Review
- Weekly Study Time — bar chart (daily minutes, Mon–Sun)
- Score Trend — area line chart (assessment scores over time)
- Topic Proficiency — per-topic breakdown (below fold)
- Knowledge Gaps — areas needing attention (below fold)

### Settings — AI Tutor Persona
- **Tutor Name** — free text (default: "Nova")
- **Voice** — 6-option selection grid:
  - Alloy · Echo · Fable · Onyx · Nova · Shimmer
  - Each with a one-line personality description
- **Teaching Style** — 3-option selection grid:
  - Encouraging (Supportive and motivating feedback)
  - Challenging (Pushes you to think deeper)
  - Neutral (Balanced and objective)
- **Preferences** — additional settings (below fold, TBD)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Backend / AI Logic | Python |
| Voice (TTS) | OpenAI TTS — voices: Alloy, Echo, Fable, Onyx, Nova, Shimmer |
| Voice (STT) | Whisper API or Web Speech API (TBD) |
| Video | WebRTC or AI avatar service (TBD) |
| File Uploads | Python backend — PDF/document parsing |
| Charts | Recharts (bar chart + area/line chart confirmed) |

---

## Design System

### Philosophy
Minimalism. Two visual zones: the sidebar (deep violet = AI territory) and the main panel
(near-white = student's workspace). These zones never bleed into each other.
Every element earns its place. Whitespace is intentional.

### Typography
- **Font:** Inter (all weights)
- Page headings: Inter Bold 24–28px
- Section labels: Inter SemiBold 14–16px
- Body / card content: Inter Regular 14px
- Stats / large values: Inter Bold 28–36px
- Muted subtext: Inter Regular, zinc-500

### Color Palette

```
Primary (60%):   #F8FAFC  — Near-white. Main content bg, cards, content surfaces.

Secondary (30%): Gradient — #1f0b47 → #2e1065 → #0f0529
                            Sidebar, active nav items, CTA buttons, stat icons,
                            "Start Voice Session" button, selected card borders.

Accent (10%):    #1E1E1E  — Near-black. Body text, borders, inactive elements.

Supporting:
  Green   #10B981  — Positive delta indicators (+X% from last week)
  Orange  #F59E0B  — Progress bars, Areas to Review icon, proficiency bars
  Red     #EF4444  — End call button only
```

### Layout & Spacing
- Sidebar: fixed ~250px wide, full viewport height
- Main content: fluid, padding ~32px all sides
- Cards: border-radius 8–12px, light border (#E2E8F0 or similar) or soft shadow
- Stat icons: 40–48px rounded square, gradient fill
- Grid gaps: 16–24px between cards

### Confirmed Component Patterns

| Component | Description |
|---|---|
| **StatCard** | Label (muted) + Large bold value + subtext + green delta |
| **ProgressBar** | Full-width thin bar, orange fill, right-aligned % label |
| **NavItem** | Icon + label; active = white text on gradient rounded pill |
| **ModeToggle** | Two-option pill tab (e.g., VIDEO CHAT / VOICE CHAT) |
| **SelectionCard** | Card with checkmark indicator when selected (border highlight) |
| **EmptyState** | Centered icon + heading + muted subtext |
| **StatusBadge** | Small pill with color dot (e.g., "● AI Ready" in green) |
| **TopicCard** | Icon + title + description + question count + progress bar |
| **AreaToReviewRow** | Topic name + category + percentage + orange bar indicator |

---

## Project Conventions

| Convention | Rule |
|---|---|
| Components | `/src/components/` — PascalCase, grouped by feature folder |
| Pages | `/src/pages/` — one file per route |
| Services | `/src/services/ai/`, `/src/services/voice/`, `/src/services/progress/` |
| Types | `/src/types/` — no `any`, all interfaces named and exported |
| Backend | `/backend/` — Python only; no AI logic bleeds into React |
| Styling | Tailwind CSS — no inline styles |
| Charts | `/src/components/charts/` — isolated chart wrappers |

---

## Out of Scope (v1)

- Multi-user / classroom support
- Social or peer-to-peer features
- Real-time human tutor escalation
- Payment / subscription infrastructure
- Mobile native app (web-first)

---

## Done When (Project Level)

- [ ] All 5 routes render with correct sidebar + main panel layout
- [ ] Active nav item is highlighted correctly per route
- [ ] Study Streak shows in sidebar bottom on all pages
- [ ] Dashboard stats, topics, and areas to review populate from data
- [ ] Voice Session: Video Chat mode renders AI video + controls
- [ ] Voice Session: Voice Chat mode renders animated mic visualization
- [ ] Voice Session: Text prompt bar works in both modes
- [ ] Documents: Drag-and-drop + file picker upload functional
- [ ] Documents: Empty state and populated file list both render correctly
- [ ] Progress: Bar chart and line/area chart render with real session data
- [ ] Settings: Tutor name, voice, and teaching style save and persist
- [ ] Settings: Selected state (border + checkmark) works on voice and style grids
- [ ] Tutor name from Settings injects into AI system prompt
- [ ] Voice selection maps to correct TTS voice at session start
- [ ] Teaching style modifies AI persona behavior in sessions
