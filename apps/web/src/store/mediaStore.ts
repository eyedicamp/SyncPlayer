"use client";

import { create } from "zustand";

type MediaStore = {
  isMicMuted: boolean;
  isCamOff: boolean;
  isPlayerReady: boolean;
  isBuffering: boolean;
  syncOffsetMs: number;
  setMicMuted: (value: boolean) => void;
  setCamOff: (value: boolean) => void;
  setPlayerReady: (value: boolean) => void;
  setBuffering: (value: boolean) => void;
  setSyncOffsetMs: (value: number) => void;
};

export const useMediaStore = create<MediaStore>((set) => ({
  isMicMuted: true,
  isCamOff: true,
  isPlayerReady: false,
  isBuffering: false,
  syncOffsetMs: 0,
  setMicMuted: (isMicMuted) => set({ isMicMuted }),
  setCamOff: (isCamOff) => set({ isCamOff }),
  setPlayerReady: (isPlayerReady) => set({ isPlayerReady }),
  setBuffering: (isBuffering) => set({ isBuffering }),
  setSyncOffsetMs: (syncOffsetMs) => set({ syncOffsetMs })
}));
