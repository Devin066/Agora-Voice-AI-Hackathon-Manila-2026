# Feature: Dashboard
# File: specs/features/dashboard.md
# WIRED Spec

## Visual Reference
![Dashboard](../../Deck%20&%20Demo/dashboard.png)

> Owner: [your name]
> Agent: lead-dev-agent
> Route: /dashboard

---

## W — Why

The Dashboard is the student's home base. Every session starts here.
It must answer three questions in under 5 seconds:
1. How am I doing? (stats)
2. What should I study next? (areas to review)
3. How do I start? (quick voice session)

If the Dashboard is slow, cluttered, or unclear — the student disengages before learning anything.

---

## I — Interface

**Component:** `src/pages/DashboardPage.tsx`

**Layout:**
```
[Header row]
  "Welcome back"
  Subtitle: "Ready for your study session today?"
  Right: "Start Voice Session" button (gradient, mic icon)

[Stat Cards row — 4 columns]
  Study Time | Average Score | Topics Reviewed | Sessions

[Quick Voice Session panel — full width]
  Mic button + "Tap to speak" label
  "AI Ready" status badge + "Active recall mode enabled" label

[Bottom section — 2 columns]
  Left (wider): Your Topics grid
    - Section heading "Your Topics" + "Manage topics" link (right-aligned)
    - Grid of TopicCards (responsive)
  Right (narrower): Areas to Review panel
    - Section heading "Areas to Review" + "View all →" link
    - List of AreaToReviewRow items
```

**Props / Data Sources:**
```typescript
DashboardPage receives from store/context:
  student: { name: string }
  stats: StatCardData[]
  topics: Topic[]
  areasToReview: AreaToReview[]
  sessionStatus: 'ready' | 'active' | 'unavailable'
  streak: number
```

**Stat Cards (4):**
| Card | Value | Subtext | Delta |
|---|---|---|---|
| Study Time | e.g., "7h 45m" | "This week" | "+12% from last week" |
| Average Score | e.g., "78%" | "On practice tests" | "+5% from last week" |
| Topics Reviewed | e.g., "27" | "This week" | (none observed) |
| Sessions | e.g., "7" | "Completed this week" | "+3% from last week" |

---

## R — Rules

- Page heading is always "Welcome back" — no student name in heading (privacy default)
- "Start Voice Session" button navigates to `/voice-session` (not opens a modal)
- Quick Voice Session mic button also navigates to `/voice-session`
- "AI Ready" badge only shows if AI service is available (check service status)
- Stat card deltas are green for positive values; only show if delta data exists
- Topics grid: show all topics the student has, ordered by last accessed
- Areas to Review: show top 3 by lowest proficiency (sorted ascending)
- "Manage topics" and "View all →" are navigation links, not buttons
- If no topics yet: show empty state inside the topics section
- If no areas to review: hide the panel entirely (don't show empty panel)

---

## E — Errors

| Scenario | Behavior |
|---|---|
| AI service unavailable | "AI Ready" badge changes to "AI Offline" in gray |
| No stats yet (new user) | Show stat cards with "—" values and no delta |
| No topics added | Topics section shows EmptyState with CTA to add topics |
| No areas to review | Hide the Areas to Review panel, expand topics section |
| Data loading | Show skeleton loaders in card shapes (no spinners) |

---

## D — Done When

- [ ] Page renders with all 4 stat cards populated from data
- [ ] Stat card deltas show green when positive
- [ ] Quick Voice Session panel shows "AI Ready" when service is available
- [ ] "Start Voice Session" button navigates to /voice-session
- [ ] Topics grid shows all student topics with proficiency bars
- [ ] Areas to Review shows top 3 lowest-proficiency topics
- [ ] Empty states render correctly when data is missing
- [ ] Skeleton loaders show during data fetch
- [ ] Layout is responsive: stack to 1 column on mobile

---

## Task Prompt for AI

```
[VOICE AI STUDY BUDDY — LEAD DEV AGENT]
Task: Build DashboardPage.tsx

Read:
- specs/features/dashboard.md (this file — fully)
- specs/FRONTEND.md (layout rules, component patterns)
- src/types/study.types.ts (data shapes)

Build DashboardPage.tsx using:
- Sidebar is in MainLayout — don't re-render it here
- Page header: "Welcome back" + subtitle + "Start Voice Session" button (right-aligned)
- 4 StatCard components in a responsive grid (4 cols desktop, 2 tablet, 1 mobile)
- QuickVoicePanel: mic button navigating to /voice-session, StatusBadge for AI state
- Two-column bottom section: TopicCard grid (left) + AreaToReviewRow list (right)
- Use EmptyState component where data may be absent
- No hardcoded content — all from props/context
- Tailwind only, no inline styles
- Gradient reserved for: Start Session button, stat card icons, active states only
```
