# Claude Code prompt — build "Career Intelligence Assistant"

> Paste this whole file into Claude Code as your first message. Then work through
> the phases in order. Do not skip ahead: each phase ends in a checkpoint that
> must render before you move on.

---

## Your role and the rules

You are building a **Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui**
implementation of a design that already exists as an HTML prototype in this bundle
(`Career Intelligence Assistant.dc.html` — open it in a browser to see the target).

The prototype is a **design reference, not code to copy**. Recreate it with real
components. Match it closely: colours, type, spacing and states are all deliberate.

Hard rules — do not violate these:

1. **No API calls, no fetch, no server actions.** Every piece of data is a hardcoded
   TypeScript constant in `lib/data.ts`. This is a UI prototype.
2. **Core Tailwind utilities only.** No arbitrary values (`h-[37px]`, `text-[13.5px]`),
   no `@apply`, no custom CSS files beyond `globals.css` for fonts and the theme
   variables. If a value isn't on the scale, round to the nearest scale step.
3. **shadcn/ui primitives only**, and only these: `button`, `card`, `input`,
   `textarea`, `badge`, `scroll-area`, `separator`, `skeleton`, `collapsible`,
   `tabs`, `toggle-group`. Nothing else. If something needs a primitive not on this
   list, build it with a `div` instead.
4. **`lucide-react` for icons only.** Stroke width `1.5` everywhere. No emoji, ever.
5. **Square corners.** Global `--radius: 0`. Nothing in this UI is rounded.
6. **No animation** beyond `animate-in fade-in` (tailwindcss-animate), the streaming
   cursor blink, and `animate-pulse` on skeletons. No gradients, no glassmorphism,
   no decorative illustrations.
7. **Colour carries meaning only** — score quality, state, source type. Never decoration.
8. Every component is a **client component** where it holds state; keep `page.tsx`
   thin.
9. **TypeScript strict.** No `any`. Every data shape has an exported interface.

---

## Phase 0 — Scaffold

```bash
npx create-next-app@latest career-intelligence --typescript --tailwind --app --eslint
cd career-intelligence
npx shadcn@latest init
npx shadcn@latest add button card input textarea badge scroll-area separator skeleton collapsible tabs toggle-group
npm i lucide-react
```

Then:

- In `app/layout.tsx`, load fonts via `next/font/google`:
  `Barlow` (400, 500, 600) as `--font-body`, `Barlow_Condensed` (500, 600, 700) as
  `--font-heading`, `IBM_Plex_Mono` (400, 500) as `--font-mono`.
  Set `<html className="dark">` and `<body className="font-body bg-canvas text-fg antialiased">`.
- Replace the shadcn theme block in `globals.css` with the token set in
  `README.md → Design tokens`. Set `--radius: 0rem`.
- Extend `tailwind.config.ts` with the named colours and font families from
  `README.md → Tailwind config`. **Do this before writing any component** — every
  later phase uses class names like `bg-panel`, `border-hairline`, `text-muted`.

**Checkpoint 0:** `npm run dev` renders a dark near-black page in Barlow. Headings
in a `font-heading` test element are condensed. Nothing is rounded.

---

## Phase 1 — Data layer

Create `lib/data.ts`. Types first, then the constants. Copy the exact strings from
`README.md → Content` — the realistic copy is a feature, not filler. Do not
paraphrase it and do not write lorem ipsum.

```ts
export interface ResumeDoc { name: string; pages: number; chunks: number; sizeKb: number; }
export interface JobDoc { id: string; num: string; title: string; company: string; source: "Pasted" | "PDF"; chunks: number; }
export interface Citation { kind: string; label: string; score: number; locator: string; chunk: string; }
export interface AnswerSection { heading?: string; para?: string; bullets?: { lead: string; text: string }[]; }
export interface AssistantAnswer { sections: AnswerSection[]; citations: Citation[]; latency: string; tokens: string; cost: string; model: string; }
export type ChatState = "empty" | "thread" | "streaming" | "error" | "noresults";
export type Screen = "setup" | "chat" | "fit";
export interface FitScore { axis: string; value: number; note: string; }
export interface FitCard { id: string; num: string; title: string; company: string; overall: number; verdict: string; scores: FitScore[]; }
```

Also add the score→colour helper — this is the *only* place colour is decided:

```ts
export function toneFor(score: number): "good" | "mid" | "low" {
  if (score >= 0.82) return "good";
  if (score >= 0.7) return "mid";
  return "low";
}
export const TONE_TEXT = { good: "text-score-good", mid: "text-score-mid", low: "text-score-low" } as const;
export const TONE_BG = { good: "bg-score-good", mid: "bg-score-mid", low: "bg-score-low" } as const;
```

**Checkpoint 1:** `npx tsc --noEmit` passes. `lib/data.ts` exports one resume,
three jobs, two full answers, one streaming target string, one no-results answer,
and three fit cards.

---

## Phase 2 — App shell

`app/page.tsx` holds one piece of state (`screen`) and renders `<AppShell>`.

The shell is a **fixed-height viewport frame** — this matters, get it right:

```tsx
<div className="flex h-screen flex-col overflow-hidden bg-canvas text-fg">
  <TopBar … />          {/* h-13 equivalent: h-14 with border-b, flex-none */}
  <ScreenRouter … />    {/* flex-1 min-h-0 */}
</div>
```

Every scrolling region inside is its own `overflow-auto` with `min-h-0` on its flex
parents. If the whole document scrolls, you've made a mistake — the chat sidebar,
scope bar and composer must never scroll away.

`TopBar` contains, left to right:
- A 22px square outlined in accent containing `CI` in condensed 700.
- `CAREER INTELLIGENCE` — condensed 600, uppercase, tracked.
- A 3-item step nav in one hairline box: `01 SETUP · 02 CHAT · 03 FIT`. Active item
  is a **solid accent fill with near-black text**; inactive is transparent with
  muted text. Each label is `whitespace-nowrap`.
- Right side, **only on the chat screen**: a `STATE` label plus a 5-button segmented
  control — `Empty · Thread · Streaming · Error · No match`. This is a *demo state
  switcher*, not a product feature; keep it visually quiet (11px, muted). Label it
  as such in a code comment so nobody ships it.

**Checkpoint 2:** All three screens are reachable by clicking the nav. Placeholder
content is fine. Resizing the window never produces a document-level scrollbar.

---

## Phase 3 — Screen 1: Setup

Single centred column, `max-w-3xl`, generous vertical rhythm (`gap-7`).

**Page head:** eyebrow `STEP 01 — DOCUMENTS` in mono 10px accent, tracked; then an
`h1` in condensed 600 ~34px; then one muted sentence explaining that answers are
grounded in these documents.

**Two blueprint cards.** A blueprint card is the signature frame of this design
system: `relative border border-hairline bg-panel p-5` plus four absolutely
positioned `+` registration marks at the corners in accent. Build this once as
`<BlueprintCard>` and reuse it — do not repeat the marks by hand.

*Card A — Resume.* Header row: `RESUME` (condensed 600 uppercase) left,
`REQUIRED · PDF ONLY` (mono 10px muted) right. Two states:
- **Empty:** a full-width dashed dropzone, ~44px vertical padding, upload icon in
  accent, "Drop your resume here" in condensed, then "or click to browse · PDF, up
  to 10 MB" muted. Hover brightens the border to accent. Clicking it fills the state.
- **Filled:** a hairline row — file icon, filename, `3 pages · 42 chunks · 218 KB`
  in mono, a green-outlined `PARSED` badge, and a square remove button whose hover
  turns it red.

*Card B — Job descriptions.* Header row with a live count on the right
(`NONE ADDED` / `2 ADDED`). Below it a two-option segmented control:
`Paste text` / `Upload PDF`.
- Paste mode: a 4-row textarea with a real placeholder, a muted hint
  ("Title and company are detected automatically."), and an `Add job description`
  button on the right.
- Upload mode: a shorter dashed dropzone.
- Empty list state: a hairline box reading "No job descriptions yet. Add at least
  one — the assistant can only compare against what you give it."
- Populated: one hairline row per job — index in mono accent, title, company,
  a `PASTED`/`PDF` chip, chunk count right-aligned in mono, remove button.
  Each row enters with `animate-in fade-in`.

**Sticky action bar** — a `flex-none border-t bg-header` strip at the bottom of the
screen, same `max-w-3xl` inner column:
- Left: the gate status. When blocked, an amber alert icon plus the **specific**
  reason — "Add your resume to continue — the assistant has nothing to compare
  against." / "Add at least one job description to continue." / both. When ready, a
  green check plus "1 resume · 3 job descriptions indexed and ready."
- Right: `CONTINUE TO CHAT` with an arrow. Solid accent when enabled; when disabled
  it is a hairline box with muted text, `cursor-not-allowed`, and `disabled`.
  **The disabled reason is always visible on screen** — never a tooltip only.

**Checkpoint 3:** Starting empty, you can click the dropzone, add jobs one at a
time, remove them, and watch the CTA gate flip. The reason text always matches the
actual missing item.

---

## Phase 4 — Screen 2: Chat (spend the most time here)

Three regions: `w-64` left rail (`flex-none border-r overflow-auto`), then a
`flex-1 min-w-0 flex flex-col min-h-0` column holding scope bar → thread → composer.

### 4a. Left rail
- `RESUME` label in mono 10px, then a hairline card with file icon, filename
  (**truncate with ellipsis**, never break mid-word), and the mono meta line.
- `JOB DESCRIPTIONS` label, then one button per job. The job currently in retrieval
  scope gets a **blue-tinted border and background**; others are near-invisible
  hairlines that brighten on hover. Clicking a job sets the scope — the rail and the
  scope pills are two views of one piece of state.
- A dashed `Manage documents` button that returns to Setup.
- Pinned to the bottom (`mt-auto`, top border): two mono stat rows —
  `Indexed chunks 90`, `Embedding text-3-large`.

### 4b. Retrieval scope bar — the most important control on the screen
A `flex-none border-b bg-panel` band with two `+` marks on its top corners.

Row 1: mono label `RETRIEVAL SCOPE`, then a wrapping row of pills:
`All jobs` + one pill per job title. **Exactly one is active.** Active = solid
accent fill, near-black text, filled 6px square marker. Inactive = hairline border,
muted text, hollow 6px square. All pills `whitespace-nowrap` with `min-h` (not fixed
`h`) so long titles never spill outside their border — let the row wrap instead.

Row 2, directly beneath — this is what makes the control unmistakable: a search icon
plus **"Answering from _<scope name>_ — <n> indexed chunks. Nothing outside this
scope is read."** The scope name is accent-coloured and semibold. The chunk count is
real: 42 resume chunks + that job's chunks, or 90 for All jobs.

### 4c. Thread
`flex-1 overflow-auto`, inner column `max-w-3xl mx-auto`, `gap-6`.

**User message:** right-aligned, `max-w-[82%]`→ use `max-w-2xl`, hairline border on
a slightly lifted panel, 14px/1.6.

**Assistant message:** left-aligned, a 24px square `CI` avatar outlined in blue,
then a `flex-1 min-w-0` column with `gap-3.5`. The body renders markdown structure:
- `h3` → condensed 600, uppercase, tracked, ~17px.
- paragraphs → 14px/1.7 in the body-text colour.
- bullets → a custom list, `list-none`, each row an em-dash in accent then
  `<strong>` lead phrase in bright text followed by muted continuation.

You may render this from the structured `AnswerSection[]` rather than parsing
markdown — that is preferable, and it keeps the markup editable.

**Citations block — the signature feature. Design it properly.**
Separated from the body by a top hairline. A quiet toggle row shows
`SOURCES (4)` in mono with a caret. Expanded, each citation is a hairline chip:

`[3px tone bar] [KIND, mono 10px, 52px wide] [label, truncating] [score, mono, tone-coloured] [caret]`

`KIND` is `RESUME` or `JOB 2` — source type is one of the three things colour is
allowed to encode. Score colour comes from `toneFor()`: ≥0.82 green, ≥0.70 amber,
below red. Clicking a chip expands it **in place** to reveal the retrieved chunk:
a mono locator line (`Page 2 · chunk 14 of 42`) then the chunk text in mono 12.5px
on a darker inset with a 2px left rule. Multiple chips can be open at once. Use
shadcn `Collapsible` for both levels.

**Metadata footer:** one mono 10.5px row in the faintest text colour —
`1.84 s · 1,240 tokens · $0.0043 · claude-sonnet · 4 chunks`, separated by dim dots.
Small, muted, not competing.

### 4d. The five states
Drive all of these from one `chatState` variable so the demo switcher can reach them.

1. **Empty:** condensed h2 "Ask about your fit", one muted paragraph, then a
   `grid-cols-2 gap-2.5` of four clickable prompt cards, each a hairline box with a
   chevron in accent. Exact copy:
   - "How does my experience align with Job 2?"
   - "What skills am I missing for Job 3?"
   - "Which job am I the strongest fit for?"
   - "Prepare me for an interview based on Job 1."
   Clicking any of them starts the streaming state.
2. **Thread:** two complete exchanges with full citations and footers.
3. **Streaming:** visible phases. A pulsing accent square plus a mono phase label:
   `Retrieving…` (0–850 ms) → `Reading 12 sources…` (850–1750 ms) →
   `Generating answer…` while words append one at a time every ~55 ms. A 7×15px
   accent block after the last word blinks at 1 s step-end. Below it a
   `Stop generating` button with a small red square; pressing it keeps the partial
   text and returns to the thread. Implement with `setTimeout`/`setInterval` in a
   `useEffect`, and **clear every timer on unmount and on state change** — a leaked
   interval here is the most likely bug in this build.
4. **Error:** the user message, then a red-tinted hairline block: alert icon,
   "Couldn't complete this answer", "The model timed out after 30 s while
   generating. Your documents are still indexed — nothing was lost.", a mono
   `upstream_timeout · req_8f21c04e` line, then a solid accent `Retry` (restarts
   streaming) and a ghost `Copy error`.
5. **No relevant results:** the assistant answers honestly in prose — it says it
   found nothing about Kubernetes in the indexed documents and points out that this
   itself is worth knowing before an infrastructure interview. **No citation chips.**
   Instead an amber-tinted note: "Retrieval returned 0 chunks above the 0.45
   similarity threshold across 90 indexed chunks. Nothing was invented to fill the
   gap." The metadata footer still shows, with `0 chunks`.

### 4e. Composer
`flex-none border-t bg-header`, inner `max-w-3xl`. A hairline box containing an
auto-sizing 1-row textarea (`max-h-28`, `resize-none`, borderless, transparent) and
a 34px solid-accent send button with a lucide `send` glyph. Under it, two muted
lines: "Answers are grounded in your documents only. Every claim is citable." on the
left and `scope: all jobs` in mono on the right.

**Checkpoint 4:** All five states reachable. Scope pills switch and the "Answering
from…" line updates. Citation chips expand to real chunk text. Streaming runs its
three phases and Stop works. Nothing overflows its border at 1024px width.

---

## Phase 5 — Screen 3: Fit

`max-w-6xl` centred. Head block: eyebrow `STEP 03 — ANALYSIS`, condensed h1
"Skill gap analysis", one muted explanatory line, and a `Re-run analysis` outline
button on the right that flips to `Analysing…` and shows the skeleton for 1.6 s.

`grid-cols-3 gap-4` of blueprint cards, one per job. Each card:
- Header: mono `JOB 02` eyebrow, condensed 600 21px title, muted company. On the
  right, the overall score in condensed 700 30px **tone-coloured**, with a mono
  uppercase verdict beneath it (`Strongest fit` / `Good fit` / `Reach`).
- A hairline separator.
- Four score rows, `gap-4`: mono uppercase axis label left, tone-coloured mono value
  right; a 4px track with a tone-coloured fill at `value * 100%`; then a 12.5px
  muted one-line justification. Axes are `TECHNICAL · EXPERIENCE · SENIORITY ·
  DOMAIN`. Every justification is specific and cites a real reason — see
  `README.md → Content`.

**Skeleton state:** the same 3-card grid built from shadcn `Skeleton`, mirroring the
real card's rhythm — three stacked bars for the header, a separator, then four
groups of (label bar, 4px track, note bar). `animate-pulse` only.

**Checkpoint 5:** Re-run shows the skeleton then the cards. Skeleton geometry
matches the loaded card closely enough that nothing jumps.

---

## Phase 6 — Polish pass

Go through this list and fix what you find:

- Keyboard focus on **every** interactive element: `focus-visible:outline-2
  focus-visible:outline-accent focus-visible:outline-offset-2`. No default blue ring.
- Hover state on every button, taken from the accent ramp — never a browser default.
- `aria-pressed` on scope pills, nav items and the segmented controls;
  `aria-expanded` on the citation toggles; `aria-label` on every icon-only button.
- `text-wrap: pretty` (`text-pretty`) on all prose paragraphs.
- No element wider than its container at 1024px; no document-level scrollbar.
- `npx tsc --noEmit` and `npm run lint` both clean.
- Grep the codebase for `[` inside `className` — any arbitrary value is a rule
  violation; move it to `tailwind.config.ts` or round it to the scale.
- Grep for `fetch(`, `useSWR`, `axios` — there should be zero hits.

---

## File layout to aim for

```
app/
  layout.tsx            fonts, dark class, body classes
  page.tsx              screen state, renders AppShell
  globals.css           theme variables only
components/
  app-shell.tsx         fixed-height frame + TopBar + router
  top-bar.tsx           brand, step nav, demo state switcher
  blueprint-card.tsx    the +-marked frame, reused everywhere
  setup/
    setup-screen.tsx
    resume-card.tsx     empty + filled states
    jobs-card.tsx       paste/upload modes, job list
    gate-bar.tsx        sticky CTA + visible disabled reason
  chat/
    chat-screen.tsx     owns chatState, scope, streaming timers
    document-rail.tsx
    scope-bar.tsx       THE control
    message-thread.tsx
    user-message.tsx
    assistant-message.tsx
    markdown-body.tsx   renders AnswerSection[]
    citations.tsx       toggle row + chips + chunk reveal
    meta-footer.tsx
    streaming-message.tsx
    error-message.tsx
    empty-state.tsx     four suggested prompts
    composer.tsx
  fit/
    fit-screen.tsx
    fit-card.tsx
    fit-skeleton.tsx
lib/
  data.ts               all hardcoded content + toneFor()
  types.ts              (optional; may live in data.ts)
```

---

## When you're done

Report back with: the three screens rendering, the five chat states reachable, and
the output of `npx tsc --noEmit`. Then stop — do not add features that were not
specified. If you thought of something clever, list it in text instead of building it.
