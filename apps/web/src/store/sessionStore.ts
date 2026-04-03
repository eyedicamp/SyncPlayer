"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionStore = {
  userName: string;
  sessionId: string;
  setUserName: (value: string) => void;
  ensureSessionId: () => string;
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      userName: "",
      sessionId: "",
      setUserName: (userName) => set({ userName }),
      ensureSessionId: () => {
        const existing = get().sessionId;
        if (existing) {
          return existing;
        }

        const sessionId = crypto.randomUUID();
        set({ sessionId });
        return sessionId;
      }
    }),
    {
      name: "syncplayer-session"
    }
  )
);
