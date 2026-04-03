"use client";

import { useMemo, useState } from "react";

import { useRoomSocket } from "../../hooks/useRoomSocket";
import { useMediaStore } from "../../store/mediaStore";
import { useRoomStore } from "../../store/roomStore";
import { useSessionStore } from "../../store/sessionStore";
import { useUiStore } from "../../store/uiStore";
import { TabPanel } from "../layout/TabPanel";
import { RoomShell } from "./RoomShell";
import { RoomHeader } from "./RoomHeader";
import { RoomStatusBar } from "./RoomStatusBar";
import { ChatPanel } from "../chat/ChatPanel";
import { ReadyPanel } from "../lobby/ReadyPanel";
import { VideoCallPanel } from "../video/VideoCallPanel";
import { YouTubePlayerPanel } from "../youtube/YouTubePlayerPanel";
import { SplitPane } from "../layout/SplitPane";
import { Button } from "../common/Button";

export function RoomPageClient({ roomId }: { roomId: string }) {
  const [draftName, setDraftName] = useState("");
  const room = useRoomStore((state) => state.room);
  const connectionState = useRoomStore((state) => state.connectionState);
  const error = useRoomStore((state) => state.error);
  const userName = useSessionStore((state) => state.userName);
  const setUserName = useSessionStore((state) => state.setUserName);
  const activeRightTab = useUiStore((state) => state.activeRightTab);
  const setActiveRightTab = useUiStore((state) => state.setActiveRightTab);
  const syncNotice = useUiStore((state) => state.syncNotice);
  const syncOffsetMs = useMediaStore((state) => state.syncOffsetMs);

  const socketApi = useRoomSocket(roomId);

  const readyCount = useMemo(
    () =>
      room?.participants.filter((participant) => participant.isReady && participant.hasPlayerReady)
        .length ?? 0,
    [room]
  );

  if (!userName.trim()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10">
        <div className="w-full rounded-[28px] border border-white/10 bg-[var(--panel)] p-8 shadow-2xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">Join room</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Enter your name to join {roomId}</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            We use your display name for room presence, chat, and the synced ready flow.
          </p>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              className="flex-1 rounded-full border border-white/10 bg-black/20 px-4 py-3 outline-none placeholder:text-white/28"
              placeholder="Your display name"
            />
            <Button
              onClick={() => {
                if (!draftName.trim()) {
                  return;
                }
                setUserName(draftName.trim());
              }}
            >
              Join room
            </Button>
          </div>

          {error ? <p className="mt-4 text-sm text-[var(--danger)]">{error}</p> : null}
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-10">
        <div className="rounded-[28px] border border-white/10 bg-[var(--panel)] px-8 py-8 text-center">
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">Connecting</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Rejoining room {roomId}…</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Connection state: {connectionState}. {error ?? "Loading current room state."}
          </p>
        </div>
      </main>
    );
  }

  const me = room.participants.find((participant) => participant.userId === socketApi.me?.userId);
  const isHost = me?.role === "host";

  return (
    <RoomShell>
      <RoomHeader
        roomId={room.roomId}
        participantCount={room.participants.length}
        isHost={Boolean(isHost)}
      />
      <RoomStatusBar
        phase={room.phase}
        connectionState={connectionState}
        bufferingPolicy={room.bufferingPolicy}
        readyText={`${readyCount}/${room.participants.length} ready`}
        syncNotice={syncNotice}
      />

      <SplitPane
        left={
          <YouTubePlayerPanel
            room={room}
            me={me ?? null}
            syncOffsetMs={syncOffsetMs}
            socketApi={socketApi}
          />
        }
        right={
          <TabPanel
            activeKey={activeRightTab}
            onChange={setActiveRightTab}
            tabs={[
              {
                key: "call",
                label: "Call",
                content: (
                  <VideoCallPanel
                    room={room}
                    me={me ?? null}
                    socketApi={socketApi}
                  />
                )
              },
              {
                key: "chat",
                label: "Chat",
                content: <ChatPanel onSend={socketApi.sendChat} />
              },
              {
                key: "lobby",
                label: "Ready",
                content: (
                  <ReadyPanel
                    room={room}
                    me={me ?? null}
                    onSetReady={socketApi.setReady}
                    onStart={socketApi.startCountdown}
                    onUpdateBufferingPolicy={socketApi.updateBufferingPolicy}
                  />
                )
              }
            ]}
          />
        }
      />
    </RoomShell>
  );
}
