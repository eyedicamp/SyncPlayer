"use client";

import { create } from "zustand";

import type { Participant, RoomSnapshotPayload, RoomState } from "@syncplayer/shared";

type ConnectionState = "disconnected" | "connecting" | "connected";

type RoomStore = {
  room: RoomState | null;
  me: Participant | null;
  connectionState: ConnectionState;
  error: string | null;
  applySnapshot: (snapshot: RoomSnapshotPayload) => void;
  setRoom: (room: RoomState) => void;
  setConnectionState: (state: ConnectionState) => void;
  setError: (error: string | null) => void;
  clearRoom: () => void;
};

export const useRoomStore = create<RoomStore>((set) => ({
  room: null,
  me: null,
  connectionState: "disconnected",
  error: null,
  applySnapshot: (snapshot) => set({ room: snapshot.room, me: snapshot.me, error: null }),
  setRoom: (room) => set((state) => ({ room, me: room.participants.find((p) => p.userId === state.me?.userId) ?? state.me })),
  setConnectionState: (connectionState) => set({ connectionState }),
  setError: (error) => set({ error }),
  clearRoom: () => set({ room: null, me: null, error: null })
}));
