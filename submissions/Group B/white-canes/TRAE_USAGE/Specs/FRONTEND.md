# FRONTEND.md — Voice AI Study Buddy
# UI Conventions, Component Map & Design Rules
# Reference this file before building any React component.

---

## Layout Architecture

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────┐  ┌──────────────────────────────────┐ │
│  │   SIDEBAR    │  │         MAIN CONTENT PANEL       │ │
│  │  ~250px wide │  │         fluid width              │ │
│  │  h-screen    │  │         overflow-y-auto          │ │
│  │  fixed/sticky│  │         p-8                      │ │
│  │              │  │                                  │ │
│  │  gradient bg │  │  #F8FAFC background              │ │
│  │              │  │                                  │ │
│  │  [Logo]      │  │  [Page Header]                   │ │
│  │  [Nav Items] │  │  [Page Content]                  │ │
│  │              │  │                                  │ │
│  │  [Streak]    │  │                                  │ │
│  └──────────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

The sidebar is the AI zone. The main panel is the student's workspace.
These are always visually distinct — never share the same background.

---

## Sidebar Component (`Sidebar.tsx`)

### Visual Spec
- Width: 250px fixed
- Height: 100vh (full viewport)
- Background: gradient — `from-[#1f0b47] via-[#2e1065] to-[#0f0529]`
- Position: fixed left, z-index above content

### Logo Area
- Icon: graduation cap or branded icon in white
- Primary text: "Study Buddy" — white, Inter SemiBold
- Sub-label: "Voice AI Tutor" — white/70 opacity, Inter Regular small

### Navigation Items
```
Props: NavItem[] — { label, icon, href, isActive }

Inactive state:  icon + label in white/70, no background
Active state:    icon + label in white, background = gradient pill
                 (rounded-lg, same gradient as sidebar but slightly lighter
                  or solid #2e1065 with white text)
Hover state:     white/90 text, subtle bg highlight
```

### Study Streak Card (Bottom)
- Sticky to bottom of sidebar
- Label: "Study Streak" — muted white
- Value: "7 Days" — white, large bold
- Subtext: "Keep it up!" — white/60

---

## Page Header Pattern

Every page follows this header structure:

```tsx
<div className="mb-8">
  <h1 className="text-2xl font-bold text-[#1E1E1E]">{pageTitle}</h1>
  <p className="text-zinc-500 mt-1">{pageSubtitle}</p>
</div>
```

Exception: Dashboard header also includes the "Start Voice Session" CTA button
aligned to the right using flex justify-between.

---

## Component Library

### StatCard (`StatCard.tsx`)

```
Props:
  label: string        — e.g., "Study Time"
  value: string        — e.g., "7h 45m"
  subtext: string      — e.g., "This week"
  delta?: string       — e.g., "+12% from last week" (green if positive)
  icon: ReactNode      — icon inside rounded gradient square

Visual:
  Card: white bg, rounded-xl, border border-zinc-100, p-6
  Icon container: 40x40px rounded-lg, gradient bg, icon in white
  Label: text-sm text-zinc-500
  Value: text-3xl font-bold text-[#1E1E1E]
  Subtext: text-sm text-zinc-500
  Delta: text-sm font-medium text-green-500 (positive) / text-red-500 (negative)
```

---

### TopicCard (`TopicCard.tsx`)

```
Props:
  icon: ReactNode
  title: string
  description: string
  questionCount: number
  proficiency: number   — 0–100

Visual:
  Card: white bg, rounded-xl, border border-zinc-100, p-6
  Icon: 32x32px in light gray rounded square
  Title: text-lg font-semibold
  Description: text-sm text-zinc-500
  Question count: text-sm text-zinc-400, "N questions"
  Proficiency label: "Proficiency" + right-aligned percentage
  Progress bar: full-width, h-1.5, bg-zinc-200 track, bg-orange-400 fill
```

---

### AreaToReviewRow (`AreaToReviewRow.tsx`)

```
Props:
  topic: string
  category: string
  proficiency: number

Visual:
  Row: flex between topic info and proficiency
  Topic name: text-sm font-medium
  Category: text-xs text-zinc-400
  Proficiency %: text-sm font-semibold text-orange-500
  Orange bar: small vertical bar or inline indicator on right edge
```

---

### ModeToggle (`ModeToggle.tsx`)

Used in Voice Session for VIDEO CHAT / VOICE CHAT switch.

```
Props:
  options: { label: string; icon: ReactNode; value: string }[]
  value: string
  onChange: (value: string) => void

Visual:
  Container: inline-flex gap-2
  Active option: gradient bg (#2e1065), white text, rounded-full px-5 py-2
  Inactive option: white bg, dark text, border border-zinc-200, rounded-full
  Icon: small icon before label text
```

---

### SelectionCard (`SelectionCard.tsx`)

Used in Settings for Voice and Teaching Style grids.

```
Props:
  title: string
  description: string
  selected: boolean
  onSelect: () => void

Visual:
  Card: rounded-xl, border, p-4, cursor-pointer
  Default: border-zinc-200, white bg
  Selected: border-[#2e1065] border-2, slight purple tint bg
  Checkmark: top-right circle, gradient fill, white checkmark icon (selected only)
  Title: text-sm font-semibold
  Description: text-xs text-zinc-400
```

---

### StatusBadge (`StatusBadge.tsx`)

```
Props:
  status: 'ready' | 'thinking' | 'speaking' | 'error'
  label: string

Visual:
  Pill: rounded-full, px-3 py-1, text-xs font-medium
  ready:    green dot + text, light green bg
  thinking: yellow dot + text, light yellow bg
  speaking: blue dot + text, light blue bg
  error:    red dot + text, light red bg
```

---

### VoiceMicVisualizer (`VoiceMicVisualizer.tsx`)

Used in Voice Chat mode.

```
Visual:
  Container: centered in the session area, square aspect
  Outer rings: 3 concentric circles, light gray, pulsing animation when active
  Center: gradient circle (~60px), microphone icon in white
  Animation: CSS pulse keyframes, staggered delay per ring
  Inactive: rings static, mic icon muted
  Active: rings pulse outward, mic icon bright white
```

---

### VideoSessionPanel (`VideoSessionPanel.tsx`)

Used in Video Chat mode.

```
Props:
  mode: 'single' | 'dual'
  — single: AI tutor video fills the panel
  — dual: AI tutor left, student right (split view)

Visual:
  Container: rounded-xl, border border-zinc-200, overflow-hidden
  Video(s): object-cover, 16:9 or fill height
  Controls bar: centered below videos
    - Camera button: gradient bg, white icon
    - End call button: red (#EF4444), phone icon (always centered)
    - Mic button: white bg, dark icon
    - Buttons: rounded-xl, ~44px square
```

---

### PromptInput (`PromptInput.tsx`)

Persistent text input at the bottom of Voice Session in both modes.

```
Props:
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  placeholder?: string   — default: "Start prompt here"

Visual:
  Full-width input, rounded-xl, border border-zinc-200, bg-white, px-4 py-3
  "+" button on right: rounded, gradient or zinc-200 bg, 28px square
  On submit: clears input, sends prompt to session service
```

---

### PromptInputBar (`PromptInputBar.tsx`)

The full bottom bar of the Voice Session page. Contains the upload trigger, text input, and send.

```
Props:
  value: string
  onChange: (v: string) => void
  onSubmit: (text: string, attachments: PendingAttachment[]) => void
  attachments: PendingAttachment[]
  onAddAttachment: (file: File) => void
  onRemoveAttachment: (id: string) => void
  placeholder?: string  — default: "Start prompt here"

Visual:
  Full-width bar: rounded-xl, border border-zinc-200, bg-white, px-3 py-2
  Left: [+] button → opens UploadMenuPopover
  Center: text input (flex-1, borderless inside the bar)
  Right: Send button (gradient, arrow icon or "Send" label)
```

---

### UploadMenuPopover (`UploadMenuPopover.tsx`)

Appears above the [+] button when clicked.

```
Props:
  onFileSelect: (file: File) => void
  onImageSelect: (file: File) => void
  onClose: () => void

Visual:
  Popover: absolute, bottom-full mb-2, rounded-xl, border border-zinc-200,
           bg-white, shadow-lg, w-48, py-1
  Two rows:
    "📄 Upload File"  — text-sm, hover:bg-zinc-50, px-4 py-2.5
    "🖼️ Upload Image" — text-sm, hover:bg-zinc-50, px-4 py-2.5
  Hidden file inputs (accept per type) triggered programmatically
  Closes on selection or click outside
```

---

### AttachmentPreviewStrip (`AttachmentPreviewStrip.tsx`)

Sits between session controls and the prompt bar. Hidden when no attachments are pending.

```
Props:
  attachments: PendingAttachment[]
  onRemove: (id: string) => void

Visual:
  Container: flex flex-nowrap gap-2 overflow-x-auto px-4 py-2
  Hidden (h-0, overflow-hidden) when attachments.length === 0
  Animated: slides down smoothly when first chip appears
```

---

### AttachmentPreviewChip (`AttachmentPreviewChip.tsx`)

```
Props:
  id: string
  filename: string
  fileType: FileType
  onRemove: () => void

Visual:
  Pill: rounded-full, border border-zinc-200, bg-white, px-3 py-1.5,
        flex items-center gap-1.5, text-sm, whitespace-nowrap
  Left: file type icon (16px, color-coded)
  Center: filename truncated to ~20 chars with ellipsis, text-zinc-700
  Right: [×] text-zinc-400 hover:text-zinc-700, cursor-pointer
```

---

### EmptyState (`EmptyState.tsx`)

```
Props:
  icon: ReactNode
  heading: string
  subtext: string
  action?: { label: string; onClick: () => void }

Visual:
  Centered in container, py-16
  Icon: 48px in light gray circle
  Heading: text-base font-medium text-zinc-600
  Subtext: text-sm text-zinc-400
  Optional action button below
```

---

## Chart Components

### WeeklyStudyTimeChart (`WeeklyStudyTimeChart.tsx`)

```
Library: Recharts (BarChart)
Data: { day: string; minutes: number }[]
Bar fill: #2e1065 (gradient secondary)
Axis: light zinc labels, no grid lines (or very light)
Tooltip: clean minimal style
```

### ScoreTrendChart (`ScoreTrendChart.tsx`)

```
Library: Recharts (AreaChart or LineChart)
Data: { day: string; score: number }[]
Line stroke: #2e1065
Area fill: light purple tint (#e8d5ff or similar, low opacity)
Axis: light zinc labels
Tooltip: clean minimal style
```

---

## Tailwind Conventions

### Color Classes
Use direct hex values in brackets for brand colors:
```
bg-[#1f0b47]     — gradient start
bg-[#2e1065]     — gradient mid / primary interactive
bg-[#0f0529]     — gradient end
bg-[#F8FAFC]     — main content bg
text-[#1E1E1E]   — primary text
```

### Gradient Utility (reuse across sidebar, buttons, icons)
```css
/* In global CSS or as a Tailwind component */
.bg-brand-gradient {
  background: linear-gradient(to bottom right, #1f0b47, #2e1065, #0f0529);
}
```

### Do NOT apply the gradient to:
- Main content backgrounds
- Card backgrounds
- Input fields
- Chart areas
- Any surface inside the main content panel

The gradient is exclusive to: sidebar, active nav items, primary CTAs, stat card icons,
selected state indicators, session control buttons (camera), voice toggle active state.

---

## TypeScript Types (Core)

```typescript
// src/types/study.types.ts

export interface StatCardData {
  label: string
  value: string
  subtext: string
  delta?: string
  deltaType?: 'positive' | 'negative'
}

export interface Topic {
  id: string
  title: string
  description: string
  icon?: string
  questionCount: number
  proficiency: number   // 0–100
}

export interface AreaToReview {
  topic: string
  category: string
  proficiency: number
}

export type FileType =
  | 'pdf' | 'doc' | 'docx' | 'txt' | 'xls' | 'xlsx' | 'csv'
  | 'png' | 'jpg' | 'jpeg' | 'webp' | 'gif'

export interface Document {
  id: string
  name: string
  size: number
  sessionDate: string   // date of the Voice Session it was shared in
  fileType: FileType
  status: 'ready' | 'processing' | 'unavailable'
}

export interface PendingAttachment {
  id: string            // temp client-side ID
  file: File
  filename: string
  fileType: FileType
  previewUrl?: string   // for images only
}

export interface TutorSettings {
  name: string
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  teachingStyle: 'encouraging' | 'challenging' | 'neutral'
}

export interface ProgressStats {
  totalStudyTime: string
  averageScore: number
  topicsMastered: number
  totalTopics: number
  areasToReview: number
}

export interface WeeklyData {
  day: string
  minutes: number
  score: number
}
```

---

## File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   ├── shared/
│   │   ├── StatCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── EmptyState.tsx
│   │   ├── SelectionCard.tsx
│   │   └── ModeToggle.tsx
│   ├── dashboard/
│   │   ├── QuickVoicePanel.tsx
│   │   ├── TopicCard.tsx
│   │   └── AreaToReviewRow.tsx
│   ├── voice-session/
│   │   ├── VideoSessionPanel.tsx
│   │   ├── VoiceMicVisualizer.tsx
│   │   ├── PromptInputBar.tsx
│   │   ├── UploadMenuPopover.tsx
│   │   ├── AttachmentPreviewStrip.tsx
│   │   └── AttachmentPreviewChip.tsx
│   ├── documents/
│   │   ├── DocumentCard.tsx
│   │   └── DocumentList.tsx
│   ├── progress/
│   │   └── (chart wrappers)
│   └── charts/
│       ├── WeeklyStudyTimeChart.tsx
│       └── ScoreTrendChart.tsx
├── pages/
│   ├── DashboardPage.tsx
│   ├── VoiceSessionPage.tsx
│   ├── DocumentsPage.tsx
│   ├── ProgressPage.tsx
│   └── SettingsPage.tsx
├── services/
│   ├── ai/
│   ├── voice/
│   └── progress/
└── types/
    └── study.types.ts
```

---

## Rules Summary

| Rule | Detail |
|---|---|
| No AI logic in components | All AI calls → `/services/ai/` |
| No voice logic in components | All STT/TTS → `/services/voice/` |
| No inline styles | Tailwind only |
| No hardcoded content | All data from props or state |
| No `any` types | All interfaces defined in `/types/` |
| Gradient is AI territory | Never apply to main content surfaces |
| Mobile first | Design from 375px up |
| Charts in wrappers | Never use raw Recharts in pages |
