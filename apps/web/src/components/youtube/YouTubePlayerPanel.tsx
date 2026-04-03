"use client";

import { useEffect } from "react";

import type { Participant, RoomState } from "@syncplayer/shared";

import { useCountdown } from "../../hooks/useCountdown";
import { useYouTubePlayer } from "../../hooks/useYouTubePlayer";
import { useMediaStore } from "../../store/mediaStore";
import { useUiStore } from "../../store/uiStore";
import { Button } from "../common/Button";
import { CountdownOverlay } from "./CountdownOverlay";
import { SyncStatusBadge } from "./SyncStatusBadge";
import { YouTubeUrlForm } from "./YouTubeUrlForm";

type YouTubePlayerPanelProps = {
  room: RoomState;
  me: Participant | null;
  syncOffsetMs: number;
  socketApi: {
    countdownEvent: { targetStartAtMs: number; eventKey: number } | null;
    playEvent: { startedAtMs: number; currentTimeSec: number; eventKey: number } | null;
    pauseEvent: { currentTimeSec: number; eventKey: number } | null;
    seekEvent: { currentTimeSec: number; eventKey: number } | null;
    syncCorrection: {
      currentTimeSec: number;
      shouldPlay: boolean;
      eventKey: number;
    } | null;
    setPlayerReady: (value: boolean) => Promise<void>;
    setVideo: (videoId: string) => Promise<void>;
    play: () => Promise<void>;
    pause: () => Promise<void>;
    seek: (currentTimeSec: number) => Promise<void>;
    heartbeat: (
      currentTimeSec: number,
      playerState: "playing" | "paused" | "buffering"
    ) => Promise<void>;
    buffering: (value: boolean) => Promise<void>;
  };
};

export function YouTubePlayerPanel({
  room,
  me,
  syncOffsetMs,
  socketApi
}: YouTubePlayerPanelProps) {
  const countdownTargetMs = useUiStore((state) => state.countdownTargetMs);
  const setPlayerReady = useMediaStore((state) => state.setPlayerReady);
  const setBuffering = useMediaStore((state) => state.setBuffering);
  const secondsLeft = useCountdown(countdownTargetMs, syncOffsetMs);
  const isHost = me?.role === "host";

  const {
    containerRef,
    currentTimeSec,
    error,
    phase,
    cueVideo,
    play,
    pause,
    seekTo
  } = useYouTubePlayer({
    onReadyChange: (value) => {
      setPlayerReady(value);
      void socketApi.setPlayerReady(value);
    },
    onBufferingChange: (value) => {
      setBuffering(value);
      void socketApi.buffering(value);
    }
  });

  useEffect(() => {
    if (!room.playback.videoId) {
      return;
    }

    cueVideo(room.playback.videoId);
  }, [cueVideo, room.playback.videoId]);

  useEffect(() => {
    if (!socketApi.playEvent) {
      return;
    }

    seekTo(socketApi.playEvent.currentTimeSec);
    const delay = socketApi.playEvent.startedAtMs - (Date.now() + syncOffsetMs);
    const timeout = window.setTimeout(() => play(), Math.max(0, delay));
    return () => window.clearTimeout(timeout);
  }, [play, seekTo, socketApi.playEvent, syncOffsetMs]);

  useEffect(() => {
    if (!socketApi.pauseEvent) {
      return;
    }

    seekTo(socketApi.pauseEvent.currentTimeSec);
    pause();
  }, [pause, seekTo, socketApi.pauseEvent]);

  useEffect(() => {
    if (!socketApi.seekEvent) {
      return;
    }

    seekTo(socketApi.seekEvent.currentTimeSec);
  }, [seekTo, socketApi.seekEvent]);

  useEffect(() => {
    if (!socketApi.syncCorrection) {
      return;
    }

    seekTo(socketApi.syncCorrection.currentTimeSec);
    if (socketApi.syncCorrection.shouldPlay) {
      play();
    } else {
      pause();
    }
  }, [pause, play, seekTo, socketApi.syncCorrection]);

  useEffect(() => {
    const playerState =
      phase === "buffering" ? "buffering" : phase === "playing" ? "playing" : "paused";

    if (!room.playback.videoId) {
      return;
    }

    const interval = window.setInterval(() => {
      void socketApi.heartbeat(currentTimeSec, playerState);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [currentTimeSec, phase, room.playback.videoId, socketApi]);

  return (
    <section className="flex h-full flex-col gap-4 px-5 py-5 lg:px-6">
      <div className="space-y-4 rounded-[28px] border border-white/8 bg-black/16 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">YouTube sync</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Shared playback stays server-scheduled.
            </h2>
          </div>
          <SyncStatusBadge
            roomPhase={room.phase}
            playerPhase={phase}
            currentTimeSec={currentTimeSec}
          />
        </div>

        {isHost ? (
          <YouTubeUrlForm
            currentVideoId={room.playback.videoId}
            disabled={room.phase === "countdown"}
            onSubmit={socketApi.setVideo}
          />
        ) : (
          <p className="text-sm text-[var(--muted)]">
            The host controls which YouTube video is loaded for the room.
          </p>
        )}
      </div>

      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/30 shadow-[0_20px_80px_rgba(0,0,0,0.32)]">
        <CountdownOverlay secondsLeft={secondsLeft} />
        <div className="aspect-video w-full">
          <div ref={containerRef} className="h-full w-full" />
        </div>
      </div>

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          disabled={!isHost || !room.playback.videoId}
          onClick={() => void socketApi.play()}
        >
          Play now
        </Button>
        <Button
          variant="secondary"
          disabled={!isHost || !room.playback.videoId}
          onClick={() => void socketApi.pause()}
        >
          Pause
        </Button>
        <Button
          variant="secondary"
          disabled={!isHost || !room.playback.videoId}
          onClick={() => void socketApi.seek(Math.max(0, currentTimeSec - 10))}
        >
          -10s
        </Button>
        <Button
          variant="secondary"
          disabled={!isHost || !room.playback.videoId}
          onClick={() => void socketApi.seek(currentTimeSec + 10)}
        >
          +10s
        </Button>
      </div>
    </section>
  );
}
