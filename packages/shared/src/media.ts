export interface SetReadyPayload {
  roomId: string;
  isReady: boolean;
}

export interface SetPlayerReadyPayload {
  roomId: string;
  hasPlayerReady: boolean;
}

export interface UpdateMediaStatePayload {
  roomId: string;
  isMicMuted: boolean;
  isCamOff: boolean;
}

export interface HostMuteUserPayload {
  roomId: string;
  targetUserId: string;
}

export interface HostMuteAllPayload {
  roomId: string;
}

export interface HostChangedPayload {
  roomId: string;
  hostId: string;
}

export interface HostTransferPayload {
  roomId: string;
  targetUserId: string;
}

export interface HostMutedPayload {
  roomId: string;
  targetUserId: string;
  byUserId: string;
  reason: "single" | "all";
}
