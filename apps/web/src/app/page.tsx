"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ROOM_EVENTS, type RoomSnapshotPayload } from "@syncplayer/shared";

import { Button } from "../components/common/Button";
import { ensureSocketConnected, waitForSocketEvent } from "../lib/socket";
import { useChatStore } from "../store/chatStore";
import { useMediaStore } from "../store/mediaStore";
import { useRoomStore } from "../store/roomStore";
import { useSessionStore } from "../store/sessionStore";

export default function HomePage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const userName = useSessionStore((state) => state.userName);
  const setUserName = useSessionStore((state) => state.setUserName);
  const ensureSessionId = useSessionStore((state) => state.ensureSessionId);
  const applySnapshot = useRoomStore((state) => state.applySnapshot);
  const setMessages = useChatStore((state) => state.setMessages);
  const setSyncOffsetMs = useMediaStore((state) => state.setSyncOffsetMs);

  const syncSnapshot = (snapshot: RoomSnapshotPayload) => {
    applySnapshot(snapshot);
    setMessages(snapshot.chatHistory);
    setSyncOffsetMs(snapshot.serverNowMs - Date.now());
  };

  const withSession = async (action: () => Promise<void>) => {
    if (!userName.trim()) {
      setError("Enter your display name first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await action();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 md:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="overflow-hidden rounded-[36px] border border-white/12 bg-[var(--panel-strong)] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-12">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--accent)]">SyncPlayer MVP</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">
            Shared YouTube playback with call, chat, countdown, and host controls in one room.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-[var(--muted)] md:text-lg">
            Create a room, drop in a YouTube link, wait until everyone is ready, then launch the
            session with a synchronized countdown. The MVP keeps the video local, the room state in
            realtime, and the call separate through LiveKit.
          </p>
          <div className="mt-10 grid gap-3 text-sm text-[var(--muted)] md:grid-cols-2">
            <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
              Host-driven playback, ready gating, countdown start, pause/seek sync, and buffering
              policy control.
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
              Side-by-side YouTube and room panel layout with integrated call, chat, and lobby tabs.
            </div>
          </div>
        </section>

        <section className="rounded-[36px] border border-white/10 bg-[var(--panel)] p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">Get started</p>
          <div className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm text-[var(--muted)]">Display name</span>
              <input
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none placeholder:text-white/28"
                placeholder="Alex"
              />
            </label>

            <Button
              className="w-full"
              disabled={isLoading}
              onClick={() =>
                withSession(async () => {
                  const sessionId = ensureSessionId();
                  const created = waitForSocketEvent<RoomSnapshotPayload>(ROOM_EVENTS.CREATED);
                  const socket = await ensureSocketConnected();
                  socket.emit(ROOM_EVENTS.CREATE, { userName, sessionId });
                  const snapshot = await created;
                  syncSnapshot(snapshot);
                  router.push(`/room/${snapshot.room.roomId}`);
                })
              }
            >
              {isLoading ? "Creating room…" : "Create room"}
            </Button>

            <div className="space-y-3 rounded-3xl border border-white/8 bg-black/20 p-4">
              <p className="text-sm text-[var(--muted)]">Or jump into an existing room.</p>
              <input
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none placeholder:text-white/28"
                placeholder="Room code"
              />
              <Button
                variant="secondary"
                className="w-full"
                disabled={isLoading}
                onClick={() =>
                  withSession(async () => {
                    const sessionId = ensureSessionId();
                    const joined = waitForSocketEvent<RoomSnapshotPayload>(ROOM_EVENTS.JOINED);
                    const socket = await ensureSocketConnected();
                    socket.emit(ROOM_EVENTS.JOIN, {
                      roomId: roomCode.trim().toUpperCase(),
                      userName,
                      sessionId
                    });
                    const snapshot = await joined;
                    syncSnapshot(snapshot);
                    router.push(`/room/${snapshot.room.roomId}`);
                  })
                }
              >
                {isLoading ? "Joining…" : "Join room"}
              </Button>
            </div>

            {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
