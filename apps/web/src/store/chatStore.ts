"use client";

import { create } from "zustand";

import type { ChatMessage } from "@syncplayer/shared";

type ChatStore = {
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  clear: () => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clear: () => set({ messages: [] })
}));
