# Feature: Documents
# File: specs/features/documents.md
# WIRED Spec

> Owner: [your name]
> Agent: lead-dev-agent
> Route: /documents

---

## W — Why

Every file a student shares during a Voice Session is automatically saved here.
The Documents page is not an upload screen — it is the student's personal study archive.

Students come here to review what they've shared, find files from past sessions,
and confirm that their materials are available to the AI during future sessions.
It answers one question: "What does my AI tutor already know about me?"

---

## I — Interface

**Component:** `src/pages/DocumentsPage.tsx`

**Layout:**
```
[Page Header]
  "Documents"
  Subtitle: "Files shared during your study sessions"

[Filter / Sort Bar]
  Left: Search input ("Search files...")
  Right: Sort dropdown ("Newest first" | "Oldest first" | "By type")

[Your Documents section]
  "All Files" heading + total file count (right-aligned, e.g., "12 files")
  [Document list or empty state]
```

**DocumentCard (per file):**
```
  File type icon (color-coded by format)
  File name
  File size
  "Shared in session" — session date/timestamp
  File type badge (e.g., "PDF", "IMAGE")
  Delete button (icon only, appears on hover)
```

**Empty State:**
```
  Document icon (muted)
  "No files yet"
  "Files you share during Voice Sessions will appear here"
```

---

## R — Rules

- No upload UI on this page — all files arrive from Voice Session attachments only
- Files are read-only from this page's perspective (view + delete only)
- Delete: removes the file from the archive and from AI context for future sessions
- Delete: requires confirmation — "Remove this file? The AI will no longer reference it."
- Search filters by filename in real time (client-side, no API call per keystroke)
- Sort options: Newest first (default), Oldest first, By type (grouped by file extension)
- "Shared in session" timestamp shows the date of the Voice Session it came from
- File type badge is color-coded: PDF = red, images = blue, docs = purple, spreadsheets = green, text = zinc
- If a file failed to save during the session (and retry succeeded later): it still appears here normally
- Files listed here are what the AI has access to — if a student deletes a file, the AI loses that context

---

## E — Errors

| Scenario | Behavior |
|---|---|
| No files yet | EmptyState: "Files you share during Voice Sessions will appear here" |
| Delete fails (network) | Error toast: "Couldn't remove file — try again"; file remains in list |
| File unavailable (corrupted/missing) | Card shows "File unavailable" badge; delete still works |
| Search returns no results | Inline empty state inside list: "No files match your search" |

---

## D — Done When

- [ ] Page renders document list populated from session upload history
- [ ] Empty state renders correctly for new students with no uploads
- [ ] Search filters the list by filename in real time
- [ ] Sort dropdown reorders the list correctly (newest, oldest, by type)
- [ ] Each DocumentCard shows: icon, name, size, session date, type badge
- [ ] Delete shows confirmation dialog before removing
- [ ] Confirmed delete removes card from list immediately
- [ ] File count in header updates after delete
- [ ] "File unavailable" badge shows if file is missing on backend
- [ ] No upload UI, upload zone, or file picker of any kind on this page

---

## Task Prompt for AI

```
[VOICE AI STUDY BUDDY — LEAD DEV AGENT]
Task: Build DocumentsPage.tsx — read-only session file archive

Read:
- specs/features/documents.md (this file — fully)
- specs/FRONTEND.md (DocumentCard, EmptyState, component patterns)
- src/types/study.types.ts (Document interface)

This page has NO upload functionality — files arrive only from Voice Sessions.
Do not add any upload zone, drag-and-drop area, or file picker to this page.

Build:
1. DocumentsPage.tsx — header + filter bar + document list
2. DocumentCard.tsx — file display: icon, name, size, session date, type badge, hover delete
3. Use EmptyState component when no files
4. Search: client-side filter on filename (no API call per keystroke)
5. Sort: client-side reorder (newest/oldest/by type)
6. Delete: confirmation dialog → call delete callback → remove from list

File data comes from props/context (fetched by the page via /services/documents/).
No upload logic anywhere in this feature.
Tailwind only. No inline styles.
```
