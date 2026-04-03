import type { BufferingPolicy, PlaybackStatus } from "./room";

export interface SetVideoPayload {
  roomId: string;
  videoId: string;
}

export interface StartCountdownPayload {
  roomId: string;
}

export interface PlaybackPlayPayload {
  roomId: string;
}

export interface PlaybackPausePayload {
  roomId: string;
}

export interface PlaybackSeekPayload {
  roomId: string;
  currentTimeSec: number;
}

export interface PlaybackHeartbeatPayload {
  roomId: string;
  currentTimeSec: number;
  playerState: PlaybackStatus;
  sentAtMs: number;
}

export interface BufferingPayload {
  roomId: string;
  isBuffering: boolean;
}

export interface SyncCorrectionPayload {
  roomId: string;
  currentTimeSec: number;
  shouldPlay: boolean;
  serverNowMs: number;
  reason: "drift" | "buffering_recovery" | "host_seek";
}

export interface CountdownStartedPayload {
  roomId: string;
  targetStartAtMs: number;
  serverNowMs: number;
}

export interface PlayNowPayload {
  roomId: string;
  startedAtMs: number;
  currentTimeSec: number;
  serverNowMs: number;
}

export interface PlaybackPolicyAppliedPayload {
  roomId: string;
  policy: BufferingPolicy;
  affectedUserId: string;
  action: "pause_all" | "resync_self";
  serverNowMs: number;
}
