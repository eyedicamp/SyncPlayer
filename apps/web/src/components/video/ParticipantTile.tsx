"use client";

import { useEffect, useRef } from "react";

import type { Participant } from "@syncplayer/shared";

import type { CallParticipant } from "../../hooks/useLiveKitRoom";
import { Button } from "../common/Button";

export function ParticipantTile({
  participant,
  liveParticipant,
  isHost,
  isMe,
  onMute,
  onTransferHost
}: {
  participant: Participant;
  liveParticipant?: CallParticipant;
  isHost: boolean;
  isMe: boolean;
  onMute?: () => void;
  onTransferHost?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!liveParticipant?.videoTrack || !videoRef.current) {
      return;
    }

    const element = liveParticipant.videoTrack.attach() as HTMLVideoElement;
    element.className = "h-full w-full object-cover";
    videoRef.current.replaceWith(element);
    videoRef.current = element;

    return () => {
      liveParticipant.videoTrack?.detach(element);
      element.remove();
    };
  }, [liveParticipant?.videoTrack]);

  useEffect(() => {
    if (!liveParticipant?.audioTrack || !audioRef.current) {
      return;
    }

    const element = liveParticipant.audioTrack.attach() as HTMLAudioElement;
    audioRef.current.replaceWith(element);
    audioRef.current = element;

    return () => {
      liveParticipant.audioTrack?.detach(element);
      element.remove();
    };
  }, [liveParticipant?.audioTrack]);

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/20">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
        {liveParticipant?.videoTrack && !participant.isCamOff ? (
          <video ref={videoRef} autoPlay playsInline muted={isMe} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-semibold text-white/70">
            {participant.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <audio ref={audioRef} autoPlay />
      </div>
      <div className="space-y-3 px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-white">
              {participant.name}
              {isMe ? " (you)" : ""}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {participant.role} · mic {participant.isMicMuted ? "muted" : "live"} · cam{" "}
              {participant.isCamOff ? "off" : "on"}
            </p>
          </div>
        </div>
        {isHost && !isMe ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={onMute}>
              Mute
            </Button>
            <Button variant="ghost" onClick={onTransferHost}>
              Make host
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
