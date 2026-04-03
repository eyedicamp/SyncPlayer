"use client";

import type { Participant, RoomState } from "@syncplayer/shared";

import { Button } from "../common/Button";
import { BufferingPolicySelector } from "./BufferingPolicySelector";
import { ParticipantReadyList } from "./ParticipantReadyList";

export function ReadyPanel({
  room,
  me,
  onSetReady,
  onStart,
  onUpdateBufferingPolicy
}: {
  room: RoomState;
  me: Participant | null;
  onSetReady: (value: boolean) => Promise<void>;
  onStart: () => Promise<void>;
  onUpdateBufferingPolicy: (value: RoomState["bufferingPolicy"]) => Promise<void>;
}) {
  const everyoneReady =
    room.playback.videoId !== null &&
    room.participants.length > 0 &&
    room.participants.every((participant) => participant.isReady && participant.hasPlayerReady);
  const isHost = me?.role === "host";

  return (
    <section className="flex h-full min-h-[420px] flex-col gap-4 overflow-y-auto px-4 py-4">
      <div className="rounded-3xl border border-white/8 bg-black/16 p-5">
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">Session readiness</p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          {everyoneReady ? "Everyone is ready to launch." : "Waiting for everyone to be ready."}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Player-ready and user-ready are separate. Everyone needs both before the host can start
          the shared countdown.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={() => onSetReady(!me?.isReady)}>
            {me?.isReady ? "Mark not ready" : "I am ready"}
          </Button>
          {isHost ? (
            <Button variant="secondary" disabled={!everyoneReady} onClick={() => void onStart()}>
              Start countdown
            </Button>
          ) : null}
        </div>
      </div>

      {isHost ? (
        <BufferingPolicySelector
          value={room.bufferingPolicy}
          onChange={onUpdateBufferingPolicy}
        />
      ) : null}

      <ParticipantReadyList participants={room.participants} meId={me?.userId ?? null} />
    </section>
  );
}
