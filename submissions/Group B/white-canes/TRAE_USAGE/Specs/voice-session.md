# Voice Session Spec

## Visual Reference
![Voice Session](../../Deck%20&%20Demo/voice-session.png)

# File: specs/features/voice-session.md
# WIRED Spec

> Owner: [your name]
> Agent: lead-dev-agent + study-buddy-agent
> Route: /voice-session

---

## W — Why

This is the core product. Everything else — documents, progress, settings — exists to
support this screen. The Voice Session is where learning actually happens.

It must feel like sitting across from a real tutor: present, responsive, focused.
Two modes serve different student preferences: those who want the face-to-face feel
(Video Chat) and those who want pure audio focus (Voice Chat).

Students can share files and images mid-conversation — just like handing your tutor
a page from your notes. Uploaded files are automatically saved to the Documents archive.

---

## I — Interface

**Component:** `src/pages/VoiceSessionPage.tsx`

**Layout:**
```
[Mode Toggle — top center]
  [ 📹 VIDEO CHAT ]  [ 🎤 VOICE CHAT ]

[Session Area — fills available height]
  VIDEO CHAT mode: VideoSessionPanel
  VOICE CHAT mode: VoiceMicVisualizer

[Session Controls — centered below session area]
  [ Camera ]  [ End Call ]  [ Microphone ]

[Upload Preview Strip — above prompt input, hidden when empty]
  Horizontally scrollable row of AttachmentPreviewChip items
  Each chip: file type icon + filename + [×] remove button

[Prompt Input Bar — bottom of page]
  [ + ]  "Start prompt here"  [ Send ]
    ↑
    Upload trigger button (file + image)
```

---

## Sub-modes

### Video Chat Mode
```
Single view (AI only):
  Full-width video panel, rounded corners
  AI tutor video feed (avatar or real video)
  Controls below: Camera · End Call (red) · Mic

Dual view (AI + Student):
  Side-by-side 50/50 split
  Left: AI tutor feed
  Right: Student camera feed
  Controls below centered
```

### Voice Chat Mode
```
Animated mic visualization:
  3 concentric light gray circles, pulsing when active
  Center: ~60px gradient circle with microphone icon in white
  Inactive: rings static, mic slightly muted
  Active/listening: rings pulse outward (CSS animation, staggered delay)
  AI speaking: different animation state (e.g., slower pulse, different color)
```

---

## Session States
```
idle      — waiting for student to start
listening — mic active, receiving student audio (circles pulse)
thinking  — AI processing response (subtle indicator)
speaking  — AI is speaking (different animation)
paused    — session paused
ended     — session complete, show summary
```

---

## The [+] Upload Button

The `[+]` button sits at the left edge of the prompt input bar.
Tapping it opens a small **upload menu** (popover above the bar):

```
┌─────────────────────┐
│  📄  Upload File    │
│  🖼️  Upload Image   │
└─────────────────────┘
```

**Upload File** — opens OS file picker
  Accepted: PDF, DOC, DOCX, TXT, XLS, XLSX, CSV

**Upload Image** — opens OS image picker
  Accepted: PNG, JPG, JPEG, WEBP, GIF

### After Selection
- File appears as an `AttachmentPreviewChip` in the Upload Preview Strip above the input bar
- Student can attach multiple files before sending
- Student can remove a pending attachment by tapping [×] on its chip
- On send (voice prompt or typed prompt): attachments are sent alongside the message
- After send: chips clear from the strip
- Uploaded files are automatically saved to the student's Documents archive in the background

### AttachmentPreviewChip
```
Props:
  filename: string
  fileType: 'pdf' | 'doc' | 'docx' | 'txt' | 'xls' | 'xlsx' | 'csv'
           | 'png' | 'jpg' | 'jpeg' | 'webp' | 'gif'
  onRemove: () => void

Visual:
  Pill: rounded-full, border border-zinc-200, bg-white, px-3 py-1.5
  Left: file type icon (small, color-coded)
  Center: filename truncated to ~20 chars with ellipsis
  Right: [×] remove button (zinc-400, hover zinc-700)
  Max visible without scroll: ~3 chips
  Container: flex-nowrap, overflow-x-auto, gap-2, hidden when empty
```

---

## R — Rules

- Mode toggle is a UI-only switch — does NOT reset the AI session
- Switching modes mid-session maintains conversation context
- Video Chat default view: AI tutor only (single view) until student camera activates
- Student camera activates on Camera button press — never auto-activated
- End Call button (red) always confirms before ending: "End session? Your progress will be saved."
- Mic button toggles mute/unmute — does not end session
- Camera button toggles video on/off — does not end session
- Session starts in the mode the student last used (persisted in settings/local state)
- AI companion name from Settings is displayed in the session UI (header or overlay)
- Text prompt input works independently of voice — student can type at any time
- If no AI service: show "AI is unavailable" message and disable session controls
- **[+] button is always visible** in the prompt bar regardless of session state
- Pending attachments persist in the strip until explicitly removed or sent
- After a file is sent to the AI, it is silently saved to Documents — no confirmation needed
- If file save to Documents fails: silent retry in background — never interrupt the session
- Accepted file types for upload are validated client-side before the picker even opens
- Unsupported format selected: show brief inline error near the strip ("Unsupported format")

---

## E — Errors

| Scenario | Behavior |
|---|---|
| Mic permission denied | Show permission prompt with instructions; disable mic button |
| Camera permission denied | Video mode shows placeholder; camera button shows error state |
| AI service down | Disable session controls, show "AI unavailable" banner |
| Network drops during session | Show reconnecting indicator; auto-retry 3x before error |
| Session ends unexpectedly | Show session summary with what was covered |
| Unsupported file type selected | Inline error near strip: "Unsupported format" — file not added |
| File too large | Inline error near strip: "File too large (max Xmb)" — file not added |
| File upload to Documents fails | Silent background retry — session is never interrupted |

---

## D — Done When

- [ ] Mode toggle switches between Video Chat and Voice Chat without losing session state
- [ ] Voice Chat mode shows animated mic with pulse animation
- [ ] Pulse animation activates when mic is listening, deactivates when muted
- [ ] Video Chat shows AI video feed in single view
- [ ] Camera button activates student camera and shows dual split view
- [ ] End Call button shows confirmation dialog before ending
- [ ] [+] button opens upload menu with "Upload File" and "Upload Image" options
- [ ] File picker opens correct accepted types for each option
- [ ] Selected files appear as AttachmentPreviewChips in the strip above the input bar
- [ ] [×] on a chip removes that attachment before sending
- [ ] Multiple attachments can be queued before sending
- [ ] Attachments send alongside the voice/text prompt
- [ ] Chips clear after send
- [ ] Uploaded files are saved to Documents archive in the background
- [ ] Unsupported format shows inline error, file not added to strip
- [ ] File too large shows inline error, file not added
- [ ] Prompt input is functional in both modes
- [ ] Session states (idle, listening, thinking, speaking) are visually distinct
- [ ] AI companion name is visible in the session UI
- [ ] Session starts in last-used mode

---

## Task Prompt for AI

```
[VOICE AI STUDY BUDDY — LEAD DEV AGENT]
Task: Build VoiceSessionPage.tsx and all sub-components

Read:
- specs/features/voice-session.md (this file — fully)
- specs/FRONTEND.md (component patterns, layout rules)
- agents/study-buddy-agent.md (AI persona context)
- src/types/study.types.ts

Build:
1. VoiceSessionPage.tsx — layout: mode toggle → session area → controls → upload strip → prompt bar
2. VoiceMicVisualizer.tsx — 3-ring concentric pulse, gradient mic center, state-driven animation
3. VideoSessionPanel.tsx — single/dual video layout with controls
4. PromptInputBar.tsx — [+] upload trigger + text input + send button
5. UploadMenuPopover.tsx — "Upload File" / "Upload Image" popover above the [+] button
6. AttachmentPreviewChip.tsx — pill chip with icon, filename, [×] remove
7. AttachmentPreviewStrip.tsx — horizontal scrollable chip row, hidden when empty
8. ModeToggle.tsx — VIDEO CHAT / VOICE CHAT pill toggle

[+] button behavior:
  - Opens UploadMenuPopover
  - "Upload File" → input accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
  - "Upload Image" → input accept=".png,.jpg,.jpeg,.webp,.gif"
  - On selection: validate type + size client-side
  - Valid: add to attachment state → renders as chip in strip
  - Invalid: show inline error, do not add

On send:
  - Attachments array passed to session service with the prompt
  - Background save to Documents via /services/documents/
  - Clear attachment state after send

Session state machine:
  idle → listening → thinking → speaking → idle (loop)
  Any state → ended (via End Call)

Voice logic → /services/voice/
AI calls → /services/ai/
Document save → /services/documents/
All components receive state and callbacks as props only.
Tailwind only. No inline styles. Gradient on active controls only.
```
