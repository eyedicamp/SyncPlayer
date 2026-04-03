"use client";

import { create } from "zustand";

type RightTab = "call" | "chat" | "lobby";

type UiStore = {
  activeRightTab: RightTab;
  isSettingsOpen: boolean;
  countdownTargetMs: number | null;
  syncNotice: string | null;
  setActiveRightTab: (tab: RightTab) => void;
  setSettingsOpen: (value: boolean) => void;
  setCountdownTargetMs: (value: number | null) => void;
  setSyncNotice: (value: string | null) => void;
};

export const useUiStore = create<UiStore>((set) => ({
  activeRightTab: "lobby",
  isSettingsOpen: false,
  countdownTargetMs: null,
  syncNotice: null,
  setActiveRightTab: (activeRightTab) => set({ activeRightTab }),
  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
  setCountdownTargetMs: (countdownTargetMs) => set({ countdownTargetMs }),
  setSyncNotice: (syncNotice) => set({ syncNotice })
}));
