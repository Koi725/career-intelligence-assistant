import type { FitCard } from "@/lib/types";

export const FIT_CARDS: FitCard[] = [
  {
    jobId: "job-1",
    jobNumber: 1,
    title: "Senior Frontend Engineer",
    company: "Stripe",
    overallScore: 78,
    verdict: "Good fit",
    axes: [
      {
        label: "Technical",
        score: 0.86,
        justification: "React and TypeScript depth exceeds the stated bar; testing practice matches.",
      },
      {
        label: "Experience",
        score: 0.81,
        justification: "Six years against a five-year ask, with comparable product surface area.",
      },
      {
        label: "Seniority",
        score: 0.72,
        justification: "Senior scope is evidenced, but no formal tech-lead title appears.",
      },
      {
        label: "Domain",
        score: 0.61,
        justification: "No payments, billing-compliance, or financial-primitives exposure found.",
      },
    ],
  },
  {
    jobId: "job-2",
    jobNumber: 2,
    title: "Staff Product Engineer",
    company: "Linear",
    overallScore: 85,
    verdict: "Strongest fit",
    axes: [
      {
        label: "Technical",
        score: 0.88,
        justification: "Stack overlaps almost exactly; only sync-engine work is unevidenced.",
      },
      {
        label: "Experience",
        score: 0.9,
        justification: "End-to-end surface ownership at Fathom maps directly to the first requirement.",
      },
      {
        label: "Seniority",
        score: 0.83,
        justification: "Operated without a PM on a four-person team — the exact expectation stated.",
      },
      {
        label: "Domain",
        score: 0.79,
        justification: "Productivity tooling adjacent; no local-first or desktop experience.",
      },
    ],
  },
  {
    jobId: "job-3",
    jobNumber: 3,
    title: "Frontend Platform Lead",
    company: "Vercel",
    overallScore: 64,
    verdict: "Reach",
    axes: [
      {
        label: "Technical",
        score: 0.74,
        justification: "Strong on application code; build-system ownership is not evidenced.",
      },
      {
        label: "Experience",
        score: 0.69,
        justification: "Design-system work is the closest analogue to platform scope.",
      },
      {
        label: "Seniority",
        score: 0.58,
        justification: "Role asks for staff-plus with mentorship of three to five engineers.",
      },
      {
        label: "Domain",
        score: 0.55,
        justification: "No edge runtime, streaming SSR, or framework-authoring experience found.",
      },
    ],
  },
];
