import { JobsCard } from "@/components/jobs-card";
import { ResumeCard } from "@/components/resume-card";

export function SetupScreen() {
  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-7 px-6 pt-10 pb-10">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            STEP 01 — DOCUMENTS
          </span>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-fg-bright">
            Add your resume and the jobs you&apos;re considering
          </h1>
          <p className="text-sm text-muted text-pretty">
            Everything the assistant says is grounded in these documents and cites the passage it came
            from. Nothing leaves this session.
          </p>
        </div>

        <ResumeCard />
        <JobsCard />
      </div>
    </div>
  );
}
