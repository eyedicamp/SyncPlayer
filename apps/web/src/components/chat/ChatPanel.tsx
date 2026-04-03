"use client";

import { useChatStore } from "../../store/chatStore";
import { ChatInput } from "./ChatInput";
import { ChatMessageList } from "./ChatMessageList";

export function ChatPanel({ onSend }: { onSend: (text: string) => Promise<void> }) {
  const messages = useChatStore((state) => state.messages);

  return (
    <section className="flex h-full min-h-[420px] flex-col">
      <ChatMessageList messages={messages} />
      <ChatInput onSend={onSend} />
    </section>
  );
}
