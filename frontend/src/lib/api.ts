import type { AnswerSection, Citation, ExchangeFooter, JobDoc, ResumeDoc } from "./types";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as Record<string, unknown>);
    throw new ApiError(res.status, (body as { detail?: string }).detail ?? `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function uploadResume(file: File): Promise<ResumeDoc> {
  const form = new FormData();
  form.append("file", file);
  return request<ResumeDoc>("/api/resume", { method: "POST", body: form });
}

export function createJobFromText(text: string): Promise<JobDoc> {
  const form = new FormData();
  form.append("text", text);
  return request<JobDoc>("/api/jobs", { method: "POST", body: form });
}

export function createJobFromFile(file: File): Promise<JobDoc> {
  const form = new FormData();
  form.append("file", file);
  return request<JobDoc>("/api/jobs", { method: "POST", body: form });
}

export function listJobs(): Promise<JobDoc[]> {
  return request<JobDoc[]>("/api/jobs");
}

export function deleteJob(id: string): Promise<void> {
  return request<void>(`/api/jobs/${id}`, { method: "DELETE" });
}

export interface StreamHandlers {
  onSources: (citations: Citation[]) => void;
  onDelta: (text: string) => void;
  onDone: (sections: AnswerSection[], footer: ExchangeFooter) => void;
  onError: (code: string, requestId: string) => void;
}

export async function streamChat(
  message: string,
  scope: string,
  handlers: StreamHandlers,
  signal: AbortSignal,
): Promise<void> {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, scope }),
    signal,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as Record<string, unknown>);
    handlers.onError(
      String(res.status),
      (body as { detail?: string }).detail ?? "",
    );
    return;
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE events are separated by \n\n; process all complete events in the buffer.
      let boundary: number;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        for (const line of block.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            handleEvent(JSON.parse(line.slice(6)) as Record<string, unknown>, handlers);
          } catch {
            // skip malformed JSON
          }
        }
      }
    }
  } catch (err) {
    if ((err as Error)?.name !== "AbortError") throw err;
    // AbortError — caller signalled stop; return normally so ChatScreen handles cleanup
  } finally {
    reader.releaseLock();
  }
}

function handleEvent(event: Record<string, unknown>, handlers: StreamHandlers): void {
  switch (event.type) {
    case "sources":
      handlers.onSources((event.citations as Citation[]) ?? []);
      break;
    case "delta":
      handlers.onDelta((event.text as string) ?? "");
      break;
    case "done":
      handlers.onDone(
        (event.sections as AnswerSection[]) ?? [],
        event.footer as ExchangeFooter,
      );
      break;
    case "error":
      handlers.onError(
        (event.code as string) ?? "error",
        (event.requestId as string) ?? "",
      );
      break;
  }
}
