
# Feature: Settings
# File: specs/features/settings.md
# WIRED Spec

> Owner: [your name]
> Agent: lead-dev-agent
> Route: /settings

---

## W — Why

The AI companion is personal. Students need to feel like it's *their* tutor — not a generic bot.
Settings exist to make that possible: name your tutor, choose their voice, choose how they teach.

This page also directly controls AI behavior. Every setting here injects into the system prompt
at session start. It is not just UI preference — it is prompt configuration.

---

## I — Interface

**Component:** `src/pages/SettingsPage.tsx`

**Layout:**
```
[Page Header]
  "Settings"
  Subtitle: "Customize your AI tutor and app preferences"

[AI Tutor Persona card]
  Card heading: icon + "AI Tutor Persona" + "Customize your AI tutor" subtext

  [Tutor Name section]
    Label: "Tutor Name"
    Input: text field, current value (e.g., "Nova"), full width

  [Voice section]
    Label: "Voice"
    Grid: 3 columns, 2 rows = 6 SelectionCards
      Alloy     — Neutral and balanced
      Echo      — Warm and friendly
      Fable     — Expressive storyteller
      Onyx      — Deep and authoritative
      Nova      — Bright and energetic
      Shimmer   — Soft and calming

  [Teaching Style section]
    Label: "Teaching Style"
    Grid: 3 columns, 1 row = 3 SelectionCards
      Encouraging  — Supportive and motivating feedback
      Challenging  — Pushes you to think deeper
      Neutral      — Balanced and objective

[Preferences card]  (below fold — details TBD with team)
```

---

## R — Rules

- Tutor Name: max 30 characters; cannot be empty; trimmed of whitespace on save
- Tutor Name: saved on blur or Enter key (not requiring an explicit save button)
- Voice selection: exactly one must always be selected (no deselect)
- Teaching Style: exactly one must always be selected (no deselect)
- Selected state: card gets border-2 in gradient purple + checkmark icon in top-right corner
- Default values: Name = "Nova", Voice = Alloy, Teaching Style = Encouraging
- All settings persist to backend (not just localStorage) — they affect AI behavior
- Save confirmation: subtle success toast after any setting change ("Saved")
- Settings inject into the AI system prompt at the start of every new session:
  - Tutor name → AI introduces itself by this name
  - Voice → TTS voice model used during session
  - Teaching style → behavior modifier in system prompt (see study-buddy-agent.md)

---

## E — Errors

| Scenario | Behavior |
|---|---|
| Name input empty on blur | Restore previous value; show inline "Name cannot be empty" |
| Name too long | Prevent input beyond 30 chars (not a post-submit error) |
| Save fails (network) | Error toast "Couldn't save — check your connection"; retry on next blur |
| Settings not loaded | Show skeleton loaders in card content; disable interaction until loaded |

---

## D — Done When

- [ ] Tutor Name input shows current saved name
- [ ] Name saves on blur and Enter with success toast
- [ ] Empty name restores previous value with error
- [ ] Voice grid shows 6 options; selected one has border + checkmark
- [ ] Teaching Style grid shows 3 options; selected one has border + checkmark
- [ ] Clicking a new voice/style deselects previous and selects new (radio behavior)
- [ ] All selections save immediately with success toast
- [ ] Default values apply for new users (Nova, Alloy, Encouraging)
- [ ] Settings persist across sessions (backend-saved)
- [ ] Tutor name and voice selection are confirmed to inject into session prompts (integration test)

---

## Task Prompt for AI

```
[VOICE AI STUDY BUDDY — LEAD DEV AGENT]
Task: Build SettingsPage.tsx and settings components

Read:
- specs/features/settings.md (this file — fully)
- specs/FRONTEND.md (SelectionCard pattern)
- src/types/study.types.ts (TutorSettings interface)
- agents/study-buddy-agent.md (understand WHY these settings exist — they drive AI behavior)

Build:
1. SettingsPage.tsx — page layout with Persona card and Preferences card
2. Use SelectionCard component for voice and teaching style grids
3. Tutor name: controlled input, save on blur + Enter
4. Voice grid: 3-column, 6 cards, radio selection behavior
5. Teaching style grid: 3-column, 3 cards, radio selection behavior

Settings save logic goes in /services/settings/ — not in components.
Selected state: border-[#2e1065] border-2 + checkmark icon top-right.
Default values: { name: "Nova", voice: "alloy", teachingStyle: "encouraging" }
Success toast on save. Error handling on empty name.
Tailwind only. No inline styles.
```
