import type { UserMessageProps } from "./user-message.types";

export function UserMessage({ text }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-2xl border border-hairline-strong bg-raised px-4 py-3 text-sm leading-6 text-fg">
        {text}
      </div>
    </div>
  );
}
