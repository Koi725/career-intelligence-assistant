import { SIMILARITY_THRESHOLD } from "@/lib/config";
import type { Citation, Exchange } from "@/lib/types";

const EXCHANGE_1_CITATIONS: Citation[] = [
  {
    id: "e1-c1",
    kind: "Resume",
    label: "Experience — Fathom, Senior Engineer",
    score: 0.91,
    locator: "Page 2 · chunk 14 of 42",
    chunk:
      "Led the rewrite of the billing dashboard (React 18, TypeScript, TanStack Query) from scoping through staged rollout to 40k accounts. Owned the surface end to end with no dedicated PM; ran the migration behind a feature flag over six weeks with zero rollback incidents.",
  },
  {
    id: "e1-c2",
    kind: "Job 2",
    label: "Responsibilities — ownership",
    score: 0.88,
    locator: "Section 2 · chunk 4 of 14",
    chunk:
      "You will own product surfaces end to end: shaping the problem, writing the code, and deciding when it ships. Staff engineers here operate without a product manager and are expected to hold the quality bar themselves.",
  },
  {
    id: "e1-c3",
    kind: "Resume",
    label: "Skills — languages and frameworks",
    score: 0.83,
    locator: "Page 1 · chunk 3 of 42",
    chunk:
      "TypeScript (6 yrs), React (6 yrs), Node, GraphQL, Playwright. Two years on the design-systems team at Nimbus maintaining a 60-component library consumed by nine product teams.",
  },
  {
    id: "e1-c4",
    kind: "Job 2",
    label: "Requirements — technical bets",
    score: 0.74,
    locator: "Section 3 · chunk 9 of 14",
    chunk:
      "Experience with local-first architectures and sync engines is a strong plus. Our client is a fully local, sync-backed data layer; comfort with conflict resolution and offline state is what separates good candidates from great ones. Electron experience welcome.",
  },
];

export const EXCHANGE_1: Exchange = {
  id: "exchange-1",
  userMessage: "How does my experience align with Job 2?",
  sections: [
    {
      heading: "Overall alignment",
      paragraph:
        "Strong. Linear weights product judgement and shipping velocity above stack breadth, and your last two roles are almost entirely that kind of work.",
      bullets: [],
    },
    {
      heading: "Where you match",
      paragraph: null,
      bullets: [
        {
          lead: "Product-owned surfaces",
          continuation:
            "— you led the billing dashboard rewrite end to end at Fathom, from scoping through staged rollout. That is the first bullet of the job description.",
        },
        {
          lead: "React and TypeScript at depth",
          continuation: "— six years, two of them on a design-systems team. The stated bar is five.",
        },
        {
          lead: "Small-team autonomy",
          continuation:
            '— Fathom\'s frontend group was four engineers. The role names "operates without a PM" explicitly.',
        },
      ],
    },
    {
      heading: "Where the gap is",
      paragraph: null,
      bullets: [
        {
          lead: "Local-first sync engines",
          continuation:
            "— absent from your resume. Named twice in the description and it is the core technical bet of the product.",
        },
        {
          lead: "Desktop application work",
          continuation: "— the description mentions Electron; your shipped work is browser-only.",
        },
      ],
    },
    {
      heading: null,
      paragraph:
        "Net: worth applying. The sync-engine gap is the one thing to address head-on rather than hope goes unnoticed.",
      bullets: [],
    },
  ],
  citations: EXCHANGE_1_CITATIONS,
  footer: {
    latencySeconds: 1.84,
    tokens: 1240,
    costDollars: 0.0043,
    model: "claude-sonnet",
    chunks: 4,
  },
};

const EXCHANGE_2_CITATIONS: Citation[] = [
  {
    id: "e2-c1",
    kind: "Job 3",
    label: "Requirements — platform scope",
    score: 0.86,
    locator: "Section 2 · chunk 6 of 16",
    chunk:
      "Own the frontend build pipeline for a 400k-line monorepo: bundling, type-checking throughput, CI wall-clock time. You will set the performance budget and defend it.",
  },
  {
    id: "e2-c2",
    kind: "Resume",
    label: "Experience — Nimbus, design systems",
    score: 0.71,
    locator: "Page 2 · chunk 21 of 42",
    chunk:
      "Maintained the shared component library and its Storybook deployment. Reduced bundle size 22% by auditing icon imports and moving to per-component entry points.",
  },
  {
    id: "e2-c3",
    kind: "Job 3",
    label: "Requirements — leadership",
    score: 0.68,
    locator: "Section 3 · chunk 11 of 16",
    chunk:
      "Grows three to five engineers through code review, design review, and direct technical mentorship. This is an individual-contributor role with explicit people impact.",
  },
];

export const EXCHANGE_2: Exchange = {
  id: "exchange-2",
  userMessage: "What skills am I missing for Job 3?",
  sections: [
    {
      heading: "Missing for Frontend Platform Lead",
      paragraph: null,
      bullets: [
        {
          lead: "Build-system ownership",
          continuation:
            "— the role expects you to own bundling and CI performance for a large monorepo. Your resume shows consuming build tooling, not owning it.",
        },
        {
          lead: "Formal mentorship track record",
          continuation:
            '— "grows three to five engineers" is stated; your resume implies mentorship but never names it.',
        },
        {
          lead: "Edge runtime familiarity",
          continuation: "— no mention of edge functions or streaming SSR anywhere in your documents.",
        },
      ],
    },
    {
      heading: null,
      paragraph:
        "Two of the three are presentation gaps rather than real ones. The build-system gap is genuine.",
      bullets: [],
    },
  ],
  citations: EXCHANGE_2_CITATIONS,
  footer: {
    latencySeconds: 2.1,
    tokens: 980,
    costDollars: 0.0034,
    model: "claude-sonnet",
    chunks: 3,
  },
};

export const EXCHANGES: Exchange[] = [EXCHANGE_1, EXCHANGE_2];

export const STREAMING_TARGET_USER = "Which job am I the strongest fit for?";

export const STREAMING_TARGET_TEXT =
  "Across all three descriptions you are the strongest fit for the Staff Product Engineer role at Linear. The scoring is close between Linear and Stripe on technical depth, but Linear weights product ownership and autonomy, and your last two roles are almost entirely autonomous surface ownership. Stripe scores higher on scale but asks for payments-domain familiarity that your resume does not";

export const ERROR_USER_MESSAGE = "Prepare me for an interview based on Job 1.";

export const NO_RESULTS_EXCHANGE: Exchange = {
  id: "no-results",
  userMessage: "What Kubernetes experience do I have relative to these roles?",
  sections: [
    {
      heading: null,
      paragraph:
        "I could not find anything about Kubernetes in your resume or in any job description currently in scope.",
      bullets: [],
    },
    {
      heading: null,
      paragraph:
        "Nothing in the indexed documents mentions Kubernetes, container orchestration, or cluster operations. If you do have that experience, it is not on the resume you uploaded — which is itself worth knowing before an infrastructure-leaning interview.",
      bullets: [],
    },
  ],
  citations: [],
  footer: {
    latencySeconds: 0.62,
    tokens: 210,
    costDollars: 0.0007,
    model: "claude-sonnet",
    chunks: 0,
  },
  note: `Retrieval returned 0 chunks above the ${SIMILARITY_THRESHOLD} similarity threshold across 90 indexed chunks. Nothing was invented to fill the gap.`,
};
