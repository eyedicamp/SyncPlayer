export type RoomPhase = "lobby" | "countdown" | "playing" | "paused";

export type BufferingPolicy = "pause_all" | "self_recover";

export type ParticipantRole = "host" | "guest";

export interface Participant {
  userId: string;
  name: string;
  role: ParticipantRole;
  isReady: boolean;
  isMicMuted: boolean;
  isCamOff: boolean;
  isBuffering: boolean;
  hasPlayerReady: boolean;
  joinedAt: number;
}

export type PlaybackStatus = "idle" | "playing" | "paused" | "buffering";

export interface PlaybackState {
  videoId: string | null;
  status: PlaybackStatus;
  currentTimeSec: number;
  startedAtMs: number | null;
  countdownTargetMs: number | null;
  lastUpdatedBy: string | null;
}

export interface RoomState {
  roomId: string;
  hostId: string;
  phase: RoomPhase;
  bufferingPolicy: BufferingPolicy;
  participants: Participant[];
  playback: PlaybackState;
}

export interface RoomSnapshotPayload {
  room: RoomState;
  me: Participant;
  chatHistory: import("./chat").ChatMessage[];
  serverNowMs: number;
}

export interface AllReadyStatusPayload {
  roomId: string;
  isAllReady: boolean;
  countdownTargetMs: number | null;
  serverNowMs: number;
}

export interface RoomErrorPayload {
  code:
    | "ROOM_NOT_FOUND"
    | "ROOM_ALREADY_EXISTS"
    | "ROOM_CREATE_FAILED"
    | "NOT_AUTHORIZED"
    | "INVALID_PAYLOAD"
    | "INVALID_VIDEO"
    | "NOT_READY"
    | "LIVEKIT_UNAVAILABLE";
  message: string;
}

export interface RoomCreatePayload {
  userName: string;
  sessionId: string;
}

export interface RoomJoinPayload {
  roomId: string;
  userName: string;
  sessionId: string;
}

export interface RoomLeavePayload {
  roomId: string;
}

export interface RoomGetStatePayload {
  roomId: string;
}
