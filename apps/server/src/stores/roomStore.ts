import type {
  BufferingPolicy,
  ChatMessage,
  Participant,
  PlaybackState,
  RoomState
} from "@syncplayer/shared";

import { createMessageId, createRoomId } from "../utils/id";

export interface ParticipantRecord extends Participant {
  sessionId: string;
  socketId: string;
}

export interface InternalRoom {
  roomId: string;
  hostId: string;
  phase: RoomState["phase"];
  bufferingPolicy: BufferingPolicy;
  participants: Map<string, ParticipantRecord>;
  playback: PlaybackState;
  chatHistory: ChatMessage[];
  countdownTimer: ReturnType<typeof setTimeout> | null;
}

export interface SocketMembership {
  roomId: string;
  sessionId: string;
}

export class RoomStore {
  private readonly rooms = new Map<string, InternalRoom>();

  private readonly socketMembership = new Map<string, SocketMembership>();

  private createParticipant(
    sessionId: string,
    socketId: string,
    userName: string,
    role: Participant["role"]
  ): ParticipantRecord {
    return {
      userId: sessionId,
      sessionId,
      socketId,
      name: userName.trim(),
      role,
      isReady: false,
      isMicMuted: true,
      isCamOff: true,
      isBuffering: false,
      hasPlayerReady: false,
      joinedAt: Date.now()
    };
  }

  createRoom(sessionId: string, socketId: string, userName: string) {
    let roomId = createRoomId();

    while (this.rooms.has(roomId)) {
      roomId = createRoomId();
    }

    const host = this.createParticipant(sessionId, socketId, userName, "host");
    const room: InternalRoom = {
      roomId,
      hostId: host.userId,
      phase: "lobby",
      bufferingPolicy: "self_recover",
      participants: new Map([[host.sessionId, host]]),
      playback: {
        videoId: null,
        status: "idle",
        currentTimeSec: 0,
        startedAtMs: null,
        countdownTargetMs: null,
        lastUpdatedBy: null
      },
      chatHistory: [],
      countdownTimer: null
    };

    this.rooms.set(roomId, room);
    this.socketMembership.set(socketId, { roomId, sessionId });

    return { room, participant: host };
  }

  getRoom(roomId: string) {
    return this.rooms.get(roomId) ?? null;
  }

  joinRoom(roomId: string, sessionId: string, socketId: string, userName: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    const existing = room.participants.get(sessionId);
    if (existing) {
      existing.socketId = socketId;
      existing.name = userName.trim();
      this.socketMembership.set(socketId, { roomId, sessionId });
      return { room, participant: existing, isNewParticipant: false };
    }

    const participant = this.createParticipant(sessionId, socketId, userName, "guest");
    room.participants.set(sessionId, participant);
    this.socketMembership.set(socketId, { roomId, sessionId });
    return { room, participant, isNewParticipant: true };
  }

  getParticipantBySocket(socketId: string) {
    const membership = this.socketMembership.get(socketId);
    if (!membership) {
      return null;
    }

    const room = this.rooms.get(membership.roomId);
    if (!room) {
      return null;
    }

    const participant = room.participants.get(membership.sessionId);
    if (!participant) {
      return null;
    }

    return { room, participant };
  }

  leaveBySocket(socketId: string) {
    const membership = this.socketMembership.get(socketId);
    if (!membership) {
      return null;
    }

    this.socketMembership.delete(socketId);
    const room = this.rooms.get(membership.roomId);
    if (!room) {
      return null;
    }

    const participant = room.participants.get(membership.sessionId);
    if (!participant) {
      return null;
    }

    room.participants.delete(membership.sessionId);

    if (room.participants.size === 0) {
      if (room.countdownTimer) {
        clearTimeout(room.countdownTimer);
      }
      this.rooms.delete(room.roomId);
      return { room, participant, deletedRoom: true, hostChanged: null };
    }

    let hostChanged: ParticipantRecord | null = null;
    if (room.hostId === participant.userId) {
      const nextHost = [...room.participants.values()].sort(
        (left, right) => left.joinedAt - right.joinedAt
      )[0];
      nextHost.role = "host";
      room.hostId = nextHost.userId;
      hostChanged = nextHost;
    }

    return { room, participant, deletedRoom: false, hostChanged };
  }

  toRoomState(room: InternalRoom): RoomState {
    return {
      roomId: room.roomId,
      hostId: room.hostId,
      phase: room.phase,
      bufferingPolicy: room.bufferingPolicy,
      participants: [...room.participants.values()].sort(
        (left, right) => left.joinedAt - right.joinedAt
      ),
      playback: { ...room.playback }
    };
  }

  addSystemMessage(room: InternalRoom, text: string) {
    const message: ChatMessage = {
      messageId: createMessageId(),
      roomId: room.roomId,
      userId: "system",
      userName: "System",
      kind: "system",
      text,
      createdAt: Date.now()
    };

    room.chatHistory.push(message);
    return message;
  }
}
