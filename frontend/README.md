# Frontend

Next.js 16 app — single-page career intelligence assistant.

## Component convention

Every component lives in `src/components/<name>/`:

```
<name>/
├── <name>.tsx        the component
├── <name>.types.ts   prop interfaces (omit if trivial)
├── <name>.test.tsx   vitest + React Testing Library
└── index.ts          re-exports only — no logic
```

Components are server-safe by default. Add `"use client"` only when the component uses state, effects, or browser APIs.

## Screens

`AppShell` owns the active screen state and renders one of three screens: `SetupScreen` (initial view), `ChatScreen` (after documents are indexed), or `FitScreen` (placeholder — not implemented). `TopBar` renders the navigation tabs and calls back to `AppShell` on change.

## State

`DocumentsProvider` (`src/hooks/use-documents/`) is the single source of truth for uploaded documents. It wraps the API calls for resume and job mutations and exposes them to any child component via `useDocuments()`. The `initialJobs` prop skips the `listJobs()` fetch on mount — tests use it to avoid mocking the network.

`ChatScreen` manages all chat state locally: `exchanges`, `streaming`, `errorInfo`. Nothing about chat is global.

## CSS and design tokens

Tailwind with custom tokens defined in `tailwind.config.ts`. All colour values go through tokens — never use raw Tailwind colour utilities like `text-gray-500`.

Key token groups:

| Token | Purpose |
|-------|---------|
| `text-fg`, `text-fg-bright`, `text-muted`, `text-faint` | text hierarchy |
| `text-accent`, `text-accent-light` | primary accent |
| `text-score-good`, `text-score-mid`, `text-score-low` | score indicators |
| `border-hairline`, `border-hairline-dashed` | borders |
| `bg-inset`, `bg-panel`, `bg-control`, `bg-control-active` | surface hierarchy |
| `font-heading`, `font-mono`, `font-body` | typeface |

## SSE client (`src/lib/api.ts`)

`streamChat` opens a `fetch` stream and parses newline-delimited SSE frames:

```typescript
streamChat(message, scope, handlers, signal)
```

- Buffers partial reads on `\n\n` boundaries using a string accumulator
- Fires `handlers.onSources`, `handlers.onDelta`, `handlers.onDone`, `handlers.onError` as events arrive
- Respects the `AbortSignal` passed by the caller — used by the Stop button in `ChatScreen`
- On `AbortError` it returns silently; the caller decides what to do with any partial text

The three-phase streaming UI in `StreamingMessage` derives its phase purely from which fields are populated:

| Phase | Condition | Label |
|-------|-----------|-------|
| 0 | no citations yet | "Retrieving…" |
| 1 | citations present, no text | "Reading N sources…" |
| 2 | text arriving | "Generating answer…" |

## Testing

```bash
npm test       # vitest run (single pass)
```

Test files live alongside the components they test. Key patterns:

**Mocking the API** — any component that renders inside `DocumentsProvider` or calls `streamChat` needs `vi.mock("@/lib/api", () => ({ ... }))` at the top of the test file. `vi.mock` is hoisted, so the factory cannot reference variables declared outside it — inline all mock data inside the factory.

**Hermetic DocumentsProvider** — pass `initialJobs={[]}` to skip the `listJobs()` fetch on mount:

```tsx
render(
  <DocumentsProvider initialJobs={[]}>
    <ComponentUnderTest />
  </DocumentsProvider>
);
```

**Async mutations** — use `waitFor` after user events that trigger API calls:

```tsx
await userEvent.click(button);
await waitFor(() => expect(screen.getByText("1 ADDED")).toBeInTheDocument());
```
