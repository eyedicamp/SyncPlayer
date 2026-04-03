"use client";

import { useState } from "react";

import { Button } from "../common/Button";

export function ChatInput({ onSend }: { onSend: (text: string) => Promise<void> }) {
  const [draft, setDraft] = useState("");

  return (
    <form
      className="border-t border-white/10 p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const text = draft.trim();
        if (!text) {
          return;
        }

        await onSend(text);
        setDraft("");
      }}
    >
      <div className="flex gap-3">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="flex-1 rounded-full border border-white/10 bg-black/20 px-4 py-3 outline-none placeholder:text-white/28"
          placeholder="Message the room"
        />
        <Button type="submit">Send</Button>
      </div>
    </form>
  );
}
