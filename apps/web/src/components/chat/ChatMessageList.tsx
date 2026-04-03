import type { ChatMessage } from "@syncplayer/shared";

export function ChatMessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
      {messages.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-[var(--muted)]">
          Room chat is empty. Join and ready events will appear here as system messages.
        </div>
      ) : null}

      {messages.map((message) => (
        <div
          key={message.messageId}
          className={
            message.kind === "system"
              ? "rounded-2xl border border-white/8 bg-black/12 px-4 py-3 text-sm text-[var(--muted)]"
              : "rounded-2xl border border-white/8 bg-white/6 px-4 py-3"
          }
        >
          {message.kind === "system" ? null : (
            <div className="mb-1 flex items-center justify-between gap-2">
              <strong className="text-sm text-white">{message.userName}</strong>
              <span className="text-xs text-[var(--muted)]">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            </div>
          )}
          <p className="text-sm leading-6 text-white/90">{message.text}</p>
        </div>
      ))}
    </div>
  );
}
