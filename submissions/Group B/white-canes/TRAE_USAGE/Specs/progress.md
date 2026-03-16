
# Feature: Progress Tracking
# File: specs/features/progress.md
# WIRED Spec

> Owner: [your name]
> Agent: lead-dev-agent
> Route: /progress

---

## W — Why

Students need to see that their effort is working.
Progress tracking closes the feedback loop between studying and improving.
It also surfaces what to study next — the knowledge gaps section is directly actionable.

Without visible progress, students lose motivation and stop coming back.

---

## I — Interface

**Component:** `src/pages/ProgressPage.tsx`

**Layout:**
```
[Page Header]
  "Progress Tracking"
  Subtitle: "Monitor your learning journey and identify areas for improvement"

[Stat Cards row — 4 columns]
  Total Study Time | Average Score | Topics Mastered | Areas to Review

[Charts row — 2 columns]
  Left: Weekly Study Time (bar chart)
  Right: Score Trend (area/line chart)

[Below fold — 2 columns]
  Left: Topic Proficiency
  Right: Knowledge Gaps
```

**Stat Cards (4):**
| Card | Value | Subtext | Delta |
|---|---|---|---|
| Total Study Time | e.g., "7h 45m" | "This week" | "+12% from last week" |
| Average Score | e.g., "78%" | "On assessments" | "+5% from last week" |
| Topics Mastered | e.g., "1" | "of 4 total" | (none) |
| Areas to Review | e.g., "3" | "Need attention" | (none) |

**Weekly Study Time Chart:**
```
Type: Bar chart
X-axis: Mon Tue Wed Thu Fri Sat Sun
Y-axis: Minutes (0, 30, 60, 90, 120)
Bar fill: #2e1065 (gradient secondary)
Chart card: white bg, rounded-xl, p-6
Title: "Weekly Study Time"
Subtitle: "Minutes spent studying each day"
```

**Score Trend Chart:**
```
Type: Area chart (line with fill)
X-axis: Mon Tue Wed Thu Fri Sat Sun
Y-axis: 0, 25, 50, 75, 100
Line stroke: #2e1065
Area fill: light purple tint, low opacity
Chart card: white bg, rounded-xl, p-6
Title: "Score Trend"
Subtitle: "Your assessment performance over time"
```

---

## R — Rules

- Charts use real session data — never mock/static data in production
- If no session data yet: show empty chart with "No data yet — start a session to track progress" message inside the chart area
- Topics Mastered: count topics where proficiency ≥ 80% (define mastery threshold with team)
- Areas to Review: count topics where proficiency < 50%
- Chart tooltips show exact value on hover
- Both charts scroll into view on mobile (don't crop)
- Delta indicators: green for positive, red for negative (or omit delta if no prior period data)

---

## E — Errors

| Scenario | Behavior |
|---|---|
| No session history | Charts show empty state inside chart area (not page-level empty state) |
| Data loading | Skeleton loaders in chart card shapes |
| Stat value unknown | Show "—" not "0" (zero implies data; dash implies no data) |

---

## D — Done When

- [ ] 4 stat cards render with correct values and deltas
- [ ] Weekly Study Time bar chart renders with real data
- [ ] Score Trend area chart renders with real data
- [ ] Charts show empty states when no data
- [ ] Skeleton loaders show during fetch
- [ ] Topic Proficiency and Knowledge Gaps sections render below fold
- [ ] Charts are responsive on mobile (horizontal scroll or reflow)

---

## Task Prompt for AI

```
[VOICE AI STUDY BUDDY — LEAD DEV AGENT]
Task: Build ProgressPage.tsx and chart components

Read:
- specs/features/progress.md (this file — fully)
- specs/FRONTEND.md (StatCard, chart patterns)
- src/types/study.types.ts (ProgressStats, WeeklyData interfaces)

Build:
1. ProgressPage.tsx — page layout with stats + charts + proficiency sections
2. WeeklyStudyTimeChart.tsx — Recharts BarChart wrapper
3. ScoreTrendChart.tsx — Recharts AreaChart wrapper

Chart components receive data as props — no data fetching inside charts.
Data fetching in ProgressPage via service hook.
Bar fill and line stroke: #2e1065.
Empty state inside chart area (not replacing the chart card entirely).
Tailwind only. No inline styles.
```

