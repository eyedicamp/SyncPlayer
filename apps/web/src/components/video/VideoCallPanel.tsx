"use client";

import { useEffect } from "react";

import type { Participant, RoomState } from "@syncplayer/shared";

import { useLiveKitRoom } from "../../hooks/useLiveKitRoom";
import { useMediaStore } from "../../store/mediaStore";
import { HostControls } from "./HostControls";
import { LocalControls } from "./LocalControls";
import { ParticipantGrid } from "./ParticipantGrid";

type VideoCallPanelProps = {
  room: RoomState;
  me: Participant | null;
  socketApi: {
    hostMuteEvent: { eventKey: number } | null;
    updateMediaState: (state: { isMicMuted: boolean; isCamOff: boolean }) => Promise<void>;
    muteUser: (userId: string) => Promise<void>;
    muteAll: () => Promise<void>;
    transferHost: (userId: string) => Promise<void>;
  };
};

export function VideoCallPanel({ room, me, socketApi }: VideoCallPanelProps) {
  const isMicMuted = useMediaStore((state) => state.isMicMuted);
  const isCamOff = useMediaStore((state) => state.isCamOff);
  const setMicMuted = useMediaStore((state) => state.setMicMuted);
  const setCamOff = useMediaStore((state) => state.setCamOff);

  const liveKit = useLiveKitRoom({
    roomId: room.roomId,
    participantIdentity: me?.userId ?? "unknown",
    participantName: me?.name ?? "Guest"
  });

  useEffect(() => {
    if (!socketApi.hostMuteEvent) {
      return;
    }

    void liveKit.forceMuteMicrophone().then(() => {
      setMicMuted(true);
      void socketApi.updateMediaState({ isMicMuted: true, isCamOff });
    });
  }, [isCamOff, liveKit, setMicMuted, socketApi]);

  return (
    <section className="flex h-full min-h-[420px] flex-col gap-4 overflow-y-auto px-4 py-4">
      <div className="rounded-3xl border border-white/8 bg-black/16 p-5">
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">LiveKit call</p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          {liveKit.status === "connected" ? "Call connected" : "Join the call when you're ready"}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Users can join as view-only first, then enable mic and camera later. Host mute requests
          stay one-way: muted participants can still choose to unmute again afterward.
        </p>

        <div className="mt-5 space-y-4">
          <LocalControls
            status={liveKit.status}
            isMicMuted={isMicMuted}
            isCamOff={isCamOff}
            onConnect={liveKit.connect}
            onDisconnect={liveKit.disconnect}
            onToggleMic={async () => {
              const nextValue = !isMicMuted;
              const success = await liveKit.setMicrophoneEnabled(!nextValue);
              if (success) {
                setMicMuted(nextValue);
                await socketApi.updateMediaState({ isMicMuted: nextValue, isCamOff });
              }
            }}
            onToggleCam={async () => {
              const nextValue = !isCamOff;
              const success = await liveKit.setCameraEnabled(!nextValue);
              if (success) {
                setCamOff(nextValue);
                await socketApi.updateMediaState({ isMicMuted, isCamOff: nextValue });
              }
            }}
          />

          {me?.role === "host" ? <HostControls onMuteAll={socketApi.muteAll} /> : null}
          {liveKit.error ? <p className="text-sm text-[var(--danger)]">{liveKit.error}</p> : null}
        </div>
      </div>

      <ParticipantGrid
        participants={room.participants}
        liveParticipants={liveKit.participants}
        meId={me?.userId ?? null}
        isHost={me?.role === "host"}
        onMute={(userId) => void socketApi.muteUser(userId)}
        onTransferHost={(userId) => void socketApi.transferHost(userId)}
      />
    </section>
  );
}
