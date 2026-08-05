---

## Frontend standards — non-negotiable

### Git — zero access

**Claude Code performs no git operations. Ever.** No `git add`, `commit`,
`push`, `checkout`, `stash`, or branch work. Not even when it seems obviously
helpful.

At the end of every task, report:
1. Files created or modified, grouped by logical change
2. What each group does, in one line
3. A suggested commit message per group
4. Anything you were unsure about

Commits are made by the human, change by change, from that report.

### Architecture — OOP principles, functional syntax

Encapsulation, single responsibility, explicit contracts, DRY — enforced hard.
Implemented with function components, custom hooks, and shared utilities.
Composition over inheritance, which is an OOP rule, not a departure from one.

- One component, one job. If you need "and" to describe it, split it.
- Every component's props are an exported `interface` in its `.types.ts`.
  No inline prop types. No `React.FC`.
- Component state stays inside the component that owns it. Lift only when two
  siblings genuinely need it — and then only to their nearest parent.
- Logic used more than once becomes a custom hook (`use-*.ts`) or a pure
  function in `src/lib/`. Never copy-pasted, never solved with a base class.
- No class components. No inheritance hierarchies. No HOCs.
- TypeScript classes are permitted only for non-React stateful logic with a
  real lifecycle. In this build that means the streaming timer controller and
  nothing else. Ask before writing a second one.

### File structure — exact, no deviation

Every component is a folder under `src/components/`, kebab-case:

src/components/scope-bar/
scope-bar.tsx the component
scope-bar.types.ts exported interfaces
scope-bar.test.tsx colocated test
index.ts re-export only: export * from "./scope-bar"


Styling mirrors it under `src/tailwind/`:

src/tailwind/
components.css imports every component css
components/
scope-bar/scope-bar.css
citations/citations.css


The cascade, in one direction only:
`<component>.css` → `components.css` → `globals.css` → imported once in
`app/layout.tsx`. **Never import a component css file from a component.**

**What belongs in a component css file:** keyframes, pseudo-elements (the
blueprint `+` marks), CSS custom properties for values off Tailwind's scale,
and complex selectors utilities can't express.

**What does not:** `@apply`. Ever. If a rule is a copy of Tailwind utilities,
it belongs in the JSX. A component with nothing to put in its css file does
not get one — an empty file is dead code.

Import order in every file: react → next → external → `@/components` →
`@/lib` → types. One blank line between groups.

### Code style

- Named imports only. Never `import *`.
- One exported component per file.
- Early returns over nested conditionals. Maximum two levels of nesting.
- No ternary chains. Two branches maximum; beyond that, a lookup map or an
  early return.
- No clever one-liners. If it needs a second read, expand it.
- No `useMemo`/`useCallback` unless a measured problem exists. Premature
  memoisation is noise.
- Handlers named for intent: `handleScopeChange`, not `onClick2`.
- Booleans read as assertions: `isStreaming`, `hasResume`, `canContinue`.
- No abbreviations except the universal ones (`id`, `url`, `ref`).
- Consistency beats personal preference. Match the file you are in.

### Comments

Rare, dry, and about **why** — never what. The code says what it does.

Good:
```ts
// Two timeouts and an interval. All three die in cleanup — a leaked interval
// here keeps "generating" running long after the component is gone.

// Overall scores are 0-100, axis scores are 0-1. Normalising here so toneFor()
// only ever sees one scale.

// The design says 0.82, not 0.8. That boundary was drawn against real score
// distributions, so leave it alone.
```

Never:
- Restating the line below it (`// set loading to true`)
- Announcing a rule you followed (`// using named imports`)
- Section banners, ASCII art, `// ===== HEADER =====`
- Manufactured jokes. Dry wit on a genuinely non-obvious decision is welcome.
  A punchline on a `useState` call is not.
- `// TODO`, `// FIXME`, commented-out code

If a comment explains confusing code, fix the code instead.

### Tests

Vitest + React Testing Library. One `.test.tsx` per component folder.

Light and real. Two to four assertions: it renders, and the one behaviour that
could silently break. No mocking gymnastics, no snapshot files, no coverage
thresholds, no testing that a `div` exists.

Test names read as sentences:
`it("shows the specific reason when only the resume is missing")`

Where the real behaviour lives — spend the effort here: gate-bar gating rules,
scope-bar state sync, citations expand/collapse, streaming timer cleanup,
`toneFor` boundaries.

### Simplicity is the tiebreaker

Two solutions that work: ship the shorter one. Complexity is a cost paid by
every future reader, and this codebase is read by a reviewer deciding whether
to hire.

If a task is turning complicated, stop and say so before writing it.