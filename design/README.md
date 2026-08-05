# Handoff: Career Intelligence Assistant

## Overview

A three-screen tool where a user uploads a resume and several job descriptions, then
chats with an assistant whose answers are grounded in — and cite — those documents.
Screen 1 collects documents, Screen 2 is the chat (the core of the product), Screen 3
scores each job against the resume on four axes.

There is no login, no landing page, no chat history, no settings. Deliberately.

## About the design files

`Career Intelligence Assistant.dc.html` in this folder is a **design reference
created in HTML** — a prototype showing intended look and behaviour. It is not
production code to copy. The task is to **recreate it** in Next.js 15 (App Router) +
TypeScript + Tailwind + shadcn/ui, using that stack's own patterns.

Open the file directly in a browser to click through it. All data in it is hardcoded;
the target build keeps it that way.

**Start with `PROMPT.md` in this folder** — it is a step-by-step, phased build script
written for Claude Code, with checkpoints. This README is the reference it points at.

## Fidelity

**High-fidelity.** Colours, type, spacing and states are final and intentional.
Recreate closely. Where a value doesn't sit on Tailwind's scale, round to the nearest
scale step rather than reaching for an arbitrary value — the design was drawn on a
4px rhythm for exactly this reason.

---

## Constraints from the brief

- Core Tailwind utilities only. No arbitrary values, no `@apply`, no custom CSS
  beyond fonts and theme variables.
- shadcn primitives only, limited to: `button`, `card`, `input`, `textarea`, `badge`,
  `scroll-area`, `separator`, `skeleton`, `collapsible`, `tabs`, `toggle-group`.
- `lucide-react` for icons only, stroke width `1.5`.
- No API calls, no fetch. All data hardcoded in `lib/data.ts`.
- No gradients, glassmorphism, decorative illustration, or emoji.
- Animation limited to fades, the streaming cursor blink, and skeleton pulse.
- Colour encodes meaning only: score quality, state, source type.
- If it can't be rebuilt in shadcn in ten minutes, it isn't in the design.

---

## Design tokens

Dark, near-black ground with a single steel-blue accent (`#5980a6`) inherited from the
project's Industry design system, inverted for dark mode. Everything is square —
`--radius: 0`.

### Surfaces

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#0e1012` | app background |
| `header` | `#101316` | top bar, left rail, composer strip |
| `panel` | `#121518` | cards, scope bar |
| `inset` | `#0f1214` | dropzones, rows inside cards, composer field |
| `deep` | `#0c0f11` | expanded citation chunk background |
| `raised` | `#181d22` | user message bubble |
| `control` | `#181c20` | secondary button face |
| `control-active` | `#232a31` | active segmented-control face |

### Borders

| Token | Hex | Use |
|---|---|---|
| `hairline-subtle` | `#1e2226` | internal separators, quiet rows |
| `hairline` | `#24282c` | default card / section border |
| `hairline-control` | `#262b30` | inputs, chips, list rows |
| `hairline-strong` | `#2c343b` | emphasised inputs, composer |
| `hairline-dashed` | `#333a41` | dropzone dashes |
| `accent-quiet` | `#3a536e` | border of the in-scope job / CI avatar |

### Text

| Token | Hex | Use |
|---|---|---|
| `fg-bright` | `#f2f4f5` | h1 / h2 |
| `fg` | `#e8eaec` | body strong, active labels |
| `fg-body` | `#c3c9ce` | prose |
| `muted` | `#9aa2a9` | secondary prose |
| `muted-2` | `#8b939a` | tertiary labels |
| `muted-3` | `#7c848b` | justifications |
| `faint` | `#6b747b` | mono chip labels |
| `faint-2` | `#5f686f` | mono section labels |
| `faintest` | `#525a61` | metadata footer |
| `dot` | `#33393e` | separator dots |

### Accent and semantics

| Token | Hex | Use |
|---|---|---|
| `accent` | `#5980a6` | primary fill, active pill, marks, icons |
| `accent-hover` | `#6d93b8` | primary hover |
| `accent-fg` | `#0b0e10` | text on accent fill |
| `accent-light` | `#8fb2d4` | accent text on dark, links |
| `accent-lighter` | `#b6cfe6` | link hover |
| `score-good` | `#6cb488` | ≥ 0.82 |
| `score-mid` | `#c3a45f` | ≥ 0.70 |
| `score-low` | `#c98d86` | < 0.70 |
| `good-bg` / `good-border` | `#12211a` / `#2f5c42` | PARSED badge |
| `warn-bg` / `warn-border` / `warn-fg` | `#161510` / `#3d3524` / `#a89463` | no-results note |
| `error-bg` / `error-border` | `#1a1213` / `#4a3330` | error block |
| `error-title` / `error-body` / `error-code` | `#e0b8b3` / `#a08b88` / `#7d6b69` | error text |

### Typography

| Role | Family | Weights | Usage |
|---|---|---|---|
| heading | **Barlow Condensed** | 500 / 600 / 700 | h1–h3, nav labels, buttons, big numbers. Usually uppercase with `tracking-wide`. |
| body | **Barlow** | 400 / 500 / 600 | all prose and UI text |
| mono | **IBM Plex Mono** | 400 / 500 | eyebrows, chip labels, scores, chunk text, metadata footer |

Sizes actually used (round to nearest Tailwind step): h1 34px/32px, h2 26px, card
title 21px, h3 17px, section head 19px, body 14px, secondary 13px, small 12.5px,
mono label 10–11px, footer 10.5px. Big overall score 30px condensed 700.

Mono labels: `text-[10px]`-equivalent → use `text-xs` with `tracking-widest` and
`uppercase`. Never below 10px.

### Tailwind config

```ts
// tailwind.config.ts — extend, don't replace
theme: {
  extend: {
    colors: {
      canvas: "#0e1012", header: "#101316", panel: "#121518", inset: "#0f1214",
      deep: "#0c0f11", raised: "#181d22", control: "#181c20",
      "control-active": "#232a31",
      hairline: { DEFAULT: "#24282c", subtle: "#1e2226", control: "#262b30", strong: "#2c343b", dashed: "#333a41" },
      fg: { DEFAULT: "#e8eaec", bright: "#f2f4f5", body: "#c3c9ce" },
      muted: { DEFAULT: "#9aa2a9", 2: "#8b939a", 3: "#7c848b" },
      faint: { DEFAULT: "#6b747b", 2: "#5f686f", 3: "#525a61" },
      accent: { DEFAULT: "#5980a6", hover: "#6d93b8", light: "#8fb2d4", lighter: "#b6cfe6", quiet: "#3a536e", fg: "#0b0e10" },
      score: { good: "#6cb488", mid: "#c3a45f", low: "#c98d86" },
    },
    fontFamily: {
      heading: ["var(--font-heading)", "sans-serif"],
      body: ["var(--font-body)", "sans-serif"],
      mono: ["var(--font-mono)", "monospace"],
    },
    borderRadius: { none: "0", DEFAULT: "0", sm: "0", md: "0", lg: "0" },
  },
}
```

### Spacing

4px rhythm throughout. Common steps: 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24,
26, 28, 40. Card padding 20px (`p-5`). Screen padding 24px (`px-6`). Section gaps
22–28px. Thread message gap 26px (`gap-6`/`gap-7`).

### The blueprint frame

The signature motif: `relative border border-hairline bg-panel` with four `+` glyphs
in accent at the corners, offset ~4–5px outside the box, 11px, `not-italic`,
`leading-none`. Applied to: both Setup cards, the scope bar (top two corners only),
and each Fit card. Build it once as `<BlueprintCard>`. Never rounded, never filled
with a surface colour beyond `panel`.

---

## Screens

### Shell (all screens)

A **fixed-height viewport frame**: `flex h-screen flex-col overflow-hidden`. The top
bar is `flex-none`, ~52px, `border-b border-hairline bg-header`. Screen content is
`flex-1 min-h-0`. Every scroll region is its own `overflow-auto`; the document itself
must never scroll.

Top bar contents:
- 22px square outlined in accent with `CI` in condensed 700 accent-light.
- `CAREER INTELLIGENCE`, condensed 600 17px, uppercase, tracked.
- Step nav in one hairline box, three buttons: `01 SETUP`, `02 CHAT`, `03 FIT`.
  Active = solid `accent` fill, `accent-fg` text, mono index at 70% opacity.
  Inactive = transparent, `muted` text, hover `control` face. All `whitespace-nowrap`.
- **Chat only**, right side: mono `STATE` label plus a 5-button segmented control —
  `Empty · Thread · Streaming · Error · No match`, 24px tall, 11px. Active face is
  `control-active`. This is a **prototype state switcher for review**, not a product
  feature — comment it as such.

### Screen 1 — Setup

`max-w-3xl` centred column, `gap-7`, `pt-10`. Head: mono accent eyebrow
`STEP 01 — DOCUMENTS`; h1 "Add your resume and the jobs you're considering"; one
muted line: "Everything the assistant says is grounded in these documents and cites
the passage it came from. Nothing leaves this session."

**Resume card** (blueprint). Header: `RESUME` / `REQUIRED · PDF ONLY`.
- Empty: dashed dropzone, `py-11`, centred column — upload icon 26px accent,
  "Drop your resume here" condensed 17px, "or click to browse · PDF, up to 10 MB"
  in `faint`. Hover: border → accent, background → slightly lifted.
- Filled: hairline row on `inset` — file icon in accent-light, filename 14px,
  `3 pages · 42 chunks · 218 KB` in mono `faint`, a `PARSED` badge (green border,
  green-tinted bg, mono 10px uppercase), and a 26px square remove button whose hover
  turns border and glyph red.

**Jobs card** (blueprint). Header: `JOB DESCRIPTIONS` / `NONE ADDED` or `N ADDED`.
Segmented control `Paste text | Upload PDF`.
- Paste: 4-row textarea, placeholder "Paste the full job description here — title,
  company, responsibilities, requirements."; below it "Title and company are detected
  automatically." left and an `Add job description` outline button right.
- Upload: dashed dropzone, `py-8`.
- Empty list: hairline box, centred, `faint` — "No job descriptions yet. Add at least
  one — the assistant can only compare against what you give it."
- Rows: mono index in accent (22px wide), title 14px, company 12.5px `muted-3`,
  source chip (`PASTED`/`PDF`, mono 10px in a hairline box), chunk count right in
  mono, remove button. Enter with a 180ms fade-up.

**Gate bar**: `flex-none border-t border-hairline bg-header py-3.5`, inner
`max-w-3xl` row.
- Ready: green check + "1 resume · 3 job descriptions indexed and ready." Right:
  `CONTINUE TO CHAT` — solid accent, condensed 600 uppercase tracked, arrow icon,
  38px tall.
- Blocked: amber alert icon + the specific reason in `score-mid`. Right: same button
  as a hairline box with `#5a636a` text, `cursor-not-allowed`, `disabled`.
  Reasons, in priority order:
  1. neither → "Add your resume and at least one job description to continue."
  2. no resume → "Add your resume to continue — the assistant has nothing to compare against."
  3. no jobs → "Add at least one job description to continue."

### Screen 2 — Chat

`flex` row: rail `w-64 flex-none border-r border-hairline bg-header overflow-auto
p-4 gap-5`, then `flex-1 min-w-0 flex flex-col min-h-0`.

**Rail.** Mono label `RESUME` + hairline card (file icon, **truncated** filename,
mono meta). Mono label `JOB DESCRIPTIONS` + one button per job: in-scope gets
`border-accent-quiet` and a blue-tinted face with accent-light index and bright
title; out-of-scope is `border-hairline-subtle` transparent with `fg-body` title,
hover lifts it. Then a dashed `Manage documents` button (plus icon) back to Setup.
Bottom, `mt-auto` above a top border: mono rows `Indexed chunks 90` and
`Embedding text-3-large`.

**Scope bar** — the single most important control. `flex-none border-b bg-panel`,
`pt-3.5 pb-3 px-6`, `+` marks on the top two corners.
- Row 1: mono `RETRIEVAL SCOPE`, then a wrapping `gap-2` pill row: `All jobs` plus
  one pill per job title. Exactly one active. Active = `bg-accent border-accent
  text-accent-fg` semibold with a filled 6px square marker; inactive = hairline
  border, `muted` text, hollow 6px square, hover → accent border + bright text.
  Pills use `min-h` + `whitespace-nowrap`, never a fixed height.
- Row 2: search icon + "Answering from **<scope>** — <n> indexed chunks. Nothing
  outside this scope is read." Scope name in `accent-light` semibold. Counts: All
  jobs = 90; a single job = 42 + that job's chunks (60 / 56 / 58).

**Thread.** `flex-1 overflow-auto px-6 pt-6`, inner `max-w-3xl mx-auto gap-6`.

*User message:* right-aligned, `max-w-2xl`, `border-hairline-strong bg-raised`,
`px-4 py-3`, 14px/1.6 `fg`.

*Assistant message:* row with `gap-3.5`; 24px square `CI` avatar
(`border-accent-quiet`, mono 9px `accent-light`); then `flex-1 min-w-0` column,
`gap-3.5`, containing body → citations → footer.

*Body* renders `AnswerSection[]`: `h3` condensed 600 17px uppercase tracked `fg`;
paragraphs 14px/1.7 `fg-body` `text-pretty`; bullet lists `list-none gap-2`, each row
an em-dash in accent then `<strong class="text-fg font-semibold">` lead + `fg-body`
continuation.

*Citations.* Top border `hairline-subtle`, `pt-3`. Toggle row: mono uppercase
`SOURCES (4)` + caret, `muted-2`, hover `fg`. Each chip: `border-hairline-subtle
bg-header`, a button row `px-2.5 py-2.5 gap-2.5` containing
— a 3px × 16px tone bar,
— mono 10px uppercase `faint` kind, fixed 52px (`RESUME` / `JOB 2`),
— label 13px `fg-body`, truncating,
— mono 11.5px score in the tone colour,
— caret in accent.
Expanded (in place, 160ms fade): `border-t-hairline-subtle bg-deep px-3 pt-3 pb-3.5`
— mono uppercase `faint-2` locator line, then the chunk in mono 12.5px/1.75 `#a7aeb4`
with a 2px `hairline-strong` left rule and 12px left padding. Several may be open.

*Footer.* One mono 10.5px `faintest` row: latency · tokens · cost · model, separated
by `dot`-coloured middots. Example: `1.84 s · 1,240 tokens · $0.0043 ·
claude-sonnet · 4 chunks`.

**States.**
1. *Empty* — `pt-8`, h2 condensed 26px "Ask about your fit"; muted paragraph "The
   assistant reads your resume and the job descriptions in scope, then answers with
   the exact passages it used. Ask about alignment, skill gaps, seniority, or
   interview prep."; then `grid-cols-2 gap-2.5` of four hairline prompt cards (accent
   chevron + text 13.5px), hover → accent border. Copy is fixed:
   "How does my experience align with Job 2?" / "What skills am I missing for Job 3?"
   / "Which job am I the strongest fit for?" / "Prepare me for an interview based on
   Job 1." Clicking any starts streaming.
2. *Thread* — the two exchanges below, with citations and footers.
3. *Streaming* — pulsing 8px accent square + mono phase label: `Retrieving…` (0–850
   ms) → `Reading 12 sources…` (850–1750 ms) → `Generating answer…` with words
   appended every 55 ms. A 7×15px accent block after the last word blinks 1 s
   step-end. `Stop generating` button below (hairline, small red square) keeps the
   partial text and drops to Thread. Clear all timers on unmount and state change.
4. *Error* — red-tinted hairline block: alert icon; "Couldn't complete this answer";
   "The model timed out after 30 s while generating. Your documents are still
   indexed — nothing was lost."; mono `upstream_timeout · req_8f21c04e`; then solid
   accent `Retry` (restarts streaming) and ghost `Copy error`.
5. *No relevant results* — prose answer (below), **no chips**, plus an amber note:
   "Retrieval returned 0 chunks above the 0.45 similarity threshold across 90 indexed
   chunks. Nothing was invented to fill the gap." Footer shows `0 chunks`.

**Composer.** `flex-none border-t bg-header px-6 pt-3.5 pb-4`, inner `max-w-3xl`.
Hairline box on `inset` holding a borderless transparent 1-row textarea
(`resize-none max-h-28`, placeholder "Ask about your fit, gaps, or interview prep…")
and a 34px solid-accent send button. Under it: "Answers are grounded in your
documents only. Every claim is citable." left, mono `scope: all jobs` right.

### Screen 3 — Fit

`max-w-6xl` centred, `px-6 pt-9 gap-6`. Head: mono eyebrow `STEP 03 — ANALYSIS`;
h1 "Skill gap analysis"; muted line "Each job scored against your resume on four
axes. Scores are derived from retrieved passages — open any answer in chat to see the
evidence."; right, a `Re-run analysis` outline button (refresh icon) that shows the
skeleton for 1.6 s and reads `Analysing…` while loading.

`grid-cols-3 gap-4` of blueprint cards. Each: header row — mono `JOB 02` eyebrow,
condensed 600 21px title, 13px `muted-2` company; right column — overall score in
condensed 700 30px in the tone colour, mono uppercase verdict beneath in the same
tone. Then a 1px `hairline-subtle` rule. Then four score rows (`gap-4`): mono
uppercase axis label `muted-2` left / mono 12px tone-coloured value right; a 4px
`#1c2126` track with a tone-coloured fill at `value × 100%`; then a 12.5px `muted-3`
justification, `text-pretty`.

**Skeleton:** same grid, `border-hairline-subtle`, shadcn `Skeleton` bars mirroring
the loaded rhythm — 9px/38%, 15px/80%, 11px/52% header bars; separator; then four
groups of 10px/44% label, 4px/100% track, 9px/88% note. `animate-pulse` only.

---

## Interactions & behaviour

| Trigger | Result |
|---|---|
| Click resume dropzone | resume state fills; PARSED badge appears |
| Click resume remove | back to empty dropzone; CTA re-gates |
| Click `Add job description` | appends the next preset job (max 3) with a fade-up |
| Click job remove | removes that job; count and CTA update |
| Toggle paste/upload | swaps the input affordance only |
| Click `CONTINUE TO CHAT` | → Chat; if documents are missing they are seeded so the chat is never empty of context |
| Click nav item | switches screen, clears any running timers |
| Click a scope pill or a rail job | sets retrieval scope; rail highlight and the "Answering from…" line update together |
| Click a suggested prompt / send | starts streaming |
| Click `Stop generating` | clears timers, keeps partial text, returns to Thread |
| Click `Retry` on error | restarts streaming |
| Click `SOURCES (n)` | collapses/expands the whole chip list |
| Click a chip | expands that chunk in place; independent of other chips |
| Click `Re-run analysis` | 1.6 s skeleton, then cards |

Transitions: 160–200 ms fade-up (`opacity` + 4px `translateY`) on message and chip
entry; 1.1 s pulse on the streaming square; 1 s step-end blink on the cursor; 1.4 s
pulse on skeletons. Nothing else moves.

## State

```ts
screen: "setup" | "chat" | "fit"
resume: ResumeDoc | null
jobs: JobDoc[]                      // starts []
jobMode: "paste" | "upload"
chatState: "empty" | "thread" | "streaming" | "error" | "noresults"
scope: "all" | jobId                // exactly one
expandedChips: Record<string, boolean>
sourcesOpen: Record<string, boolean>   // default open
streamPhase: 0 | 1 | 2 | 3
streamWords: number
fitLoading: boolean
```

Derived: `canContinue = !!resume && jobs.length > 0`; `blockedReason` from the table
above; `scopeChunks` = 90 or 42 + job chunks. Streaming uses two `setTimeout`s and one
`setInterval`; all three must be cleared on unmount, on screen change, on Stop, and
on any `chatState` change.

## Content

**Resume:** `Alex_Morgan_Resume_2026.pdf` — 3 pages · 42 chunks · 218 KB.

**Jobs:**
1. Senior Frontend Engineer — Stripe · Remote (US) — Pasted — 18 chunks
2. Staff Product Engineer — Linear · Remote (Global) — PDF — 14 chunks
3. Frontend Platform Lead — Vercel · San Francisco — Pasted — 16 chunks

**Exchange 1** — user: "How does my experience align with Job 2?"

Assistant sections:
- *Overall alignment* — "Strong. Linear weights product judgement and shipping
  velocity above stack breadth, and your last two roles are almost entirely that kind
  of work."
- *Where you match* — bullets: **Product-owned surfaces** "— you led the billing
  dashboard rewrite end to end at Fathom, from scoping through staged rollout. That
  is the first bullet of the job description." / **React and TypeScript at depth**
  "— six years, two of them on a design-systems team. The stated bar is five." /
  **Small-team autonomy** "— Fathom's frontend group was four engineers. The role
  names \"operates without a PM\" explicitly."
- *Where the gap is* — bullets: **Local-first sync engines** "— absent from your
  resume. Named twice in the description and it is the core technical bet of the
  product." / **Desktop application work** "— the description mentions Electron; your
  shipped work is browser-only."
- closing paragraph — "Net: worth applying. The sync-engine gap is the one thing to
  address head-on rather than hope goes unnoticed."

Citations (kind / label / score / locator / chunk):
1. `Resume` / "Experience — Fathom, Senior Engineer" / 0.91 / "Page 2 · chunk 14 of 42" /
   "Led the rewrite of the billing dashboard (React 18, TypeScript, TanStack Query)
   from scoping through staged rollout to 40k accounts. Owned the surface end to end
   with no dedicated PM; ran the migration behind a feature flag over six weeks with
   zero rollback incidents."
2. `Job 2` / "Responsibilities — ownership" / 0.88 / "Section 2 · chunk 4 of 14" /
   "You will own product surfaces end to end: shaping the problem, writing the code,
   and deciding when it ships. Staff engineers here operate without a product manager
   and are expected to hold the quality bar themselves."
3. `Resume` / "Skills — languages and frameworks" / 0.83 / "Page 1 · chunk 3 of 42" /
   "TypeScript (6 yrs), React (6 yrs), Node, GraphQL, Playwright. Two years on the
   design-systems team at Nimbus maintaining a 60-component library consumed by nine
   product teams."
4. `Job 2` / "Requirements — technical bets" / 0.74 / "Section 3 · chunk 9 of 14" /
   "Experience with local-first architectures and sync engines is a strong plus. Our
   client is a fully local, sync-backed data layer; comfort with conflict resolution
   and offline state is what separates good candidates from great ones. Electron
   experience welcome."

Footer: `1.84 s · 1,240 tokens · $0.0043 · claude-sonnet · 4 chunks`

**Exchange 2** — user: "What skills am I missing for Job 3?"

Assistant, section *Missing for Frontend Platform Lead* — bullets:
**Build-system ownership** "— the role expects you to own bundling and CI performance
for a large monorepo. Your resume shows consuming build tooling, not owning it." /
**Formal mentorship track record** "— \"grows three to five engineers\" is stated;
your resume implies mentorship but never names it." / **Edge runtime familiarity**
"— no mention of edge functions or streaming SSR anywhere in your documents."
Closing paragraph: "Two of the three are presentation gaps rather than real ones. The
build-system gap is genuine."

Citations:
1. `Job 3` / "Requirements — platform scope" / 0.86 / "Section 2 · chunk 6 of 16" /
   "Own the frontend build pipeline for a 400k-line monorepo: bundling, type-checking
   throughput, CI wall-clock time. You will set the performance budget and defend it."
2. `Resume` / "Experience — Nimbus, design systems" / 0.71 / "Page 2 · chunk 21 of 42" /
   "Maintained the shared component library and its Storybook deployment. Reduced
   bundle size 22% by auditing icon imports and moving to per-component entry points."
3. `Job 3` / "Requirements — leadership" / 0.68 / "Section 3 · chunk 11 of 16" /
   "Grows three to five engineers through code review, design review, and direct
   technical mentorship. This is an individual-contributor role with explicit people
   impact."

Footer: `2.10 s · 980 tokens · $0.0034 · claude-sonnet · 3 chunks`

**Streaming target** (user: "Which job am I the strongest fit for?") — reveal word by
word, and note it is deliberately cut off mid-sentence so Stop always has something
to interrupt:

"Across all three descriptions you are the strongest fit for the Staff Product
Engineer role at Linear. The scoring is close between Linear and Stripe on technical
depth, but Linear weights product ownership and autonomy, and your last two roles are
almost entirely autonomous surface ownership. Stripe scores higher on scale but asks
for payments-domain familiarity that your resume does not"

**Error state** user message: "Prepare me for an interview based on Job 1."

**No-results** user: "What Kubernetes experience do I have relative to these roles?"
Assistant paragraphs: "I could not find anything about Kubernetes in your resume or in
any job description currently in scope." / "Nothing in the indexed documents mentions
Kubernetes, container orchestration, or cluster operations. If you do have that
experience, it is not on the resume you uploaded — which is itself worth knowing
before an infrastructure-leaning interview."
Footer: `0.62 s · 210 tokens · $0.0007 · claude-sonnet · 0 chunks`

**Fit cards.**

*Job 01 — Senior Frontend Engineer, Stripe — overall 78, "Good fit" (mid)*
- Technical 0.86 — "React and TypeScript depth exceeds the stated bar; testing practice matches."
- Experience 0.81 — "Six years against a five-year ask, with comparable product surface area."
- Seniority 0.72 — "Senior scope is evidenced, but no formal tech-lead title appears."
- Domain 0.61 — "No payments, billing-compliance, or financial-primitives exposure found."

*Job 02 — Staff Product Engineer, Linear — overall 85, "Strongest fit" (good)*
- Technical 0.88 — "Stack overlaps almost exactly; only sync-engine work is unevidenced."
- Experience 0.90 — "End-to-end surface ownership at Fathom maps directly to the first requirement."
- Seniority 0.83 — "Operated without a PM on a four-person team — the exact expectation stated."
- Domain 0.79 — "Productivity tooling adjacent; no local-first or desktop experience."

*Job 03 — Frontend Platform Lead, Vercel — overall 64, "Reach" (low)*
- Technical 0.74 — "Strong on application code; build-system ownership is not evidenced."
- Experience 0.69 — "Design-system work is the closest analogue to platform scope."
- Seniority 0.58 — "Role asks for staff-plus with mentorship of three to five engineers."
- Domain 0.55 — "No edge runtime, streaming SSR, or framework-authoring experience found."

## Assets

None. All icons are `lucide-react`: `upload`, `file-text`, `x`, `plus`, `search`,
`check`, `alert-circle`, `alert-triangle`, `chevron-right`, `arrow-right`,
`refresh-cw`, `send`. Stroke width 1.5. Fonts come from Google Fonts via `next/font`.

## Accessibility

`focus-visible:outline-2 outline-accent outline-offset-2` on every interactive
element — never the browser default. `aria-pressed` on scope pills, nav items and
segmented controls. `aria-expanded` on both citation toggle levels. `aria-label` on
every icon-only button. The disabled CTA keeps its reason as visible text, not a
tooltip. Body text meets 4.5:1 on `canvas`; the accent is used for chrome, large text
and icons only.

## Files in this bundle

- `PROMPT.md` — the phased build script to hand to Claude Code. Start here.
- `README.md` — this reference.
- `Career Intelligence Assistant.dc.html` — the HTML design prototype. Open in a
  browser; use the STATE switcher in the top bar to reach all five chat states.

## Not in scope

No landing page, marketing copy, pricing, login, signup, settings, user profile,
chat history, or multiple conversations. Do not add features that were not specified.

## Ideas deliberately left out

Listed rather than built, per the brief: a diff view mapping each resume bullet to the
JD requirement it answers; a per-citation "insert as evidence" action that drafts a
cover-letter paragraph; a similarity-threshold slider in the scope bar.
