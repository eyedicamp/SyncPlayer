import {
  CHAT_EVENTS,
  HOST_EVENTS,
  PARTICIPANT_EVENTS,
  PLAYBACK_EVENTS,
  ROOM_EVENTS,
  SESSION_EVENTS,
  SETTINGS_EVENTS,
  type BufferingPayload,
  type ChatMessage,
  type ChatSendPayload,
  type HostMuteAllPayload,
  type HostMuteUserPayload,
  type HostTransferPayload,
  type PlaybackHeartbeatPayload,
  type PlaybackPausePayload,
  type PlaybackPlayPayload,
  type PlaybackSeekPayload,
  type RoomCreatePayload,
  type RoomErrorPayload,
  type RoomGetStatePayload,
  type RoomJoinPayload,
  type RoomLeavePayload,
  type SetVideoPayload,
  type StartCountdownPayload,
  type SetPlayerReadyPayload,
  type SetReadyPayload,
  type UpdateBufferingPolicyPayload,
  type UpdateMediaStatePayload
} from "@syncplayer/shared";
import type { Server, Socket } from "socket.io";

import { createMessageId } from "../utils/id";
import { InternalRoom, RoomStore, type ParticipantRecord } from "../stores/roomStore";

function buildError(code: RoomErrorPayload["code"], message: string): RoomErrorPayload {
  return { code, message };
}

export class RoomService {
  constructor(
    private readonly io: Server,
    private readonly roomStore: RoomStore
  ) {}

  private emitError(socket: Socket, error: RoomErrorPayload) {
    socket.emit(ROOM_EVENTS.ERROR, error);
  }

  private emitRoomState(room: InternalRoom) {
    this.io.to(room.roomId).emit(ROOM_EVENTS.STATE, this.roomStore.toRoomState(room));
  }

  private emitReadyStatus(room: InternalRoom) {
    const isAllReady =
      room.playback.videoId !== null &&
      room.participants.size > 0 &&
      [...room.participants.values()].every(
        (participant) => participant.isReady && participant.hasPlayerReady
      );

    const payload = {
      roomId: room.roomId,
      isAllReady,
      countdownTargetMs: room.playback.countdownTargetMs,
      serverNowMs: Date.now()
    };

    this.io
      .to(room.roomId)
      .emit(isAllReady ? SESSION_EVENTS.ALL_READY : SESSION_EVENTS.NOT_READY, payload);
  }

  private emitMessage(room: InternalRoom, message: ChatMessage) {
    this.io.to(room.roomId).emit(CHAT_EVENTS.MESSAGE, message);
  }

  private makeSnapshot(room: InternalRoom, participant: ParticipantRecord) {
    return {
      room: this.roomStore.toRoomState(room),
      me: participant,
      chatHistory: [...room.chatHistory],
      serverNowMs: Date.now()
    };
  }

  private requireRoom(roomId: string) {
    const room = this.roomStore.getRoom(roomId);
    if (!room) {
      throw buildError("ROOM_NOT_FOUND", "That room could not be found.");
    }
    return room;
  }

  private requireSocketContext(socket: Socket) {
    const context = this.roomStore.getParticipantBySocket(socket.id);
    if (!context) {
      throw buildError("ROOM_NOT_FOUND", "You are not connected to an active room.");
    }

    return context;
  }

  private requireHost(socket: Socket, roomId: string) {
    const { room, participant } = this.requireSocketContext(socket);
    if (room.roomId !== roomId) {
      throw buildError("ROOM_NOT_FOUND", "You are not connected to that room.");
    }

    if (participant.role !== "host") {
      throw buildError("NOT_AUTHORIZED", "Only the host can perform that action.");
    }

    return { room, participant };
  }

  private setCountdown(room: InternalRoom, targetStartAtMs: number) {
    if (room.countdownTimer) {
      clearTimeout(room.countdownTimer);
    }

    room.phase = "countdown";
    room.playback.countdownTargetMs = targetStartAtMs;
    room.playback.startedAtMs = null;

    room.countdownTimer = setTimeout(() => {
      room.phase = "playing";
      room.playback.status = "playing";
      room.playback.startedAtMs = targetStartAtMs;
      room.playback.countdownTargetMs = null;
      room.playback.lastUpdatedBy = room.hostId;
      room.countdownTimer = null;
      this.emitRoomState(room);
      this.io.to(room.roomId).emit(PLAYBACK_EVENTS.PLAY_NOW, {
        roomId: room.roomId,
        startedAtMs: targetStartAtMs,
        currentTimeSec: room.playback.currentTimeSec,
        serverNowMs: Date.now()
      });
    }, Math.max(0, targetStartAtMs - Date.now()));
  }

  private cancelCountdown(room: InternalRoom, reasonText?: string) {
    if (!room.countdownTimer && room.playback.countdownTargetMs === null) {
      return;
    }

    if (room.countdownTimer) {
      clearTimeout(room.countdownTimer);
      room.countdownTimer = null;
    }

    room.phase = room.playback.status === "playing" ? "playing" : "lobby";
    room.playback.countdownTargetMs = null;
    if (reasonText) {
      const message = this.roomStore.addSystemMessage(room, reasonText);
      this.emitMessage(room, message);
    }
    this.emitRoomState(room);
    this.emitReadyStatus(room);
  }

  createRoom(socket: Socket, payload: RoomCreatePayload) {
    if (!payload.userName?.trim() || !payload.sessionId?.trim()) {
      this.emitError(
        socket,
        buildError("INVALID_PAYLOAD", "A display name is required to create a room.")
      );
      return;
    }

    const { room, participant } = this.roomStore.createRoom(
      payload.sessionId.trim(),
      socket.id,
      payload.userName
    );

    socket.join(room.roomId);

    const joinedMessage = this.roomStore.addSystemMessage(
      room,
      `${participant.name} created the room.`
    );

    socket.emit(ROOM_EVENTS.CREATED, this.makeSnapshot(room, participant));
    this.emitMessage(room, joinedMessage);
    this.emitRoomState(room);
    this.emitReadyStatus(room);
  }

  joinRoom(socket: Socket, payload: RoomJoinPayload) {
    if (!payload.userName?.trim() || !payload.sessionId?.trim() || !payload.roomId?.trim()) {
      this.emitError(
        socket,
        buildError("INVALID_PAYLOAD", "Room ID and display name are required to join.")
      );
      return;
    }

    const joined = this.roomStore.joinRoom(
      payload.roomId.trim().toUpperCase(),
      payload.sessionId.trim(),
      socket.id,
      payload.userName
    );

    if (!joined) {
      this.emitError(socket, buildError("ROOM_NOT_FOUND", "That room does not exist."));
      return;
    }

    const { room, participant, isNewParticipant } = joined;
    socket.join(room.roomId);

    if (room.phase === "countdown" && isNewParticipant) {
      this.cancelCountdown(room, `${participant.name} joined, so the countdown was cancelled.`);
    }

    socket.emit(ROOM_EVENTS.JOINED, this.makeSnapshot(room, participant));

    if (isNewParticipant) {
      const message = this.roomStore.addSystemMessage(room, `${participant.name} joined the room.`);
      this.emitMessage(room, message);
    }

    this.emitRoomState(room);
    this.emitReadyStatus(room);
  }

  leaveRoom(socket: Socket, payload?: RoomLeavePayload) {
    if (payload?.roomId) {
      const context = this.roomStore.getParticipantBySocket(socket.id);
      if (!context || context.room.roomId !== payload.roomId) {
        return;
      }
    }

    const left = this.roomStore.leaveBySocket(socket.id);
    if (!left || left.deletedRoom) {
      socket.emit(ROOM_EVENTS.LEFT, { roomId: payload?.roomId ?? null });
      return;
    }

    socket.leave(left.room.roomId);

    if (left.room.phase === "countdown") {
      this.cancelCountdown(
        left.room,
        `${left.participant.name} left, so the countdown was cancelled.`
      );
    }

    const message = this.roomStore.addSystemMessage(
      left.room,
      `${left.participant.name} left the room.`
    );
    this.emitMessage(left.room, message);

    if (left.hostChanged) {
      this.io.to(left.room.roomId).emit(HOST_EVENTS.CHANGED, {
        roomId: left.room.roomId,
        hostId: left.hostChanged.userId
      });
      const hostMessage = this.roomStore.addSystemMessage(
        left.room,
        `${left.hostChanged.name} is now the host.`
      );
      this.emitMessage(left.room, hostMessage);
    }

    socket.emit(ROOM_EVENTS.LEFT, { roomId: left.room.roomId });
    this.emitRoomState(left.room);
    this.emitReadyStatus(left.room);
  }

  getState(socket: Socket, payload: RoomGetStatePayload) {
    try {
      const room = this.requireRoom(payload.roomId.trim().toUpperCase());
      const context = this.roomStore.getParticipantBySocket(socket.id);
      if (!context || context.room.roomId !== room.roomId) {
        throw buildError("ROOM_NOT_FOUND", "Join the room before requesting its state.");
      }

      socket.emit(ROOM_EVENTS.JOINED, this.makeSnapshot(room, context.participant));
      this.emitReadyStatus(room);
    } catch (error) {
      this.emitError(
        socket,
        (error as RoomErrorPayload) ?? buildError("ROOM_NOT_FOUND", "Could not load room state.")
      );
    }
  }

  setReady(socket: Socket, payload: SetReadyPayload) {
    try {
      const { room, participant } = this.requireSocketContext(socket);
      if (room.roomId !== payload.roomId) {
        throw buildError("ROOM_NOT_FOUND", "That room could not be found.");
      }

      participant.isReady = payload.isReady;
      this.io.to(room.roomId).emit(PARTICIPANT_EVENTS.UPDATED, participant);
      const message = this.roomStore.addSystemMessage(
        room,
        payload.isReady
          ? `${participant.name} is ready.`
          : `${participant.name} is no longer ready.`
      );
      this.emitMessage(room, message);

      if (!payload.isReady && room.phase === "countdown") {
        this.cancelCountdown(room, `${participant.name} unreadied, so the countdown was cancelled.`);
      }

      this.emitRoomState(room);
      this.emitReadyStatus(room);
    } catch (error) {
      this.emitError(socket, error as RoomErrorPayload);
    }
  }

  setPlayerReady(socket: Socket, payload: SetPlayerReadyPayload) {
    try {
      const { room, participant } = this.requireSocketContext(socket);
      if (room.roomId !== payload.roomId) {
        throw buildError("ROOM_NOT_FOUND", "That room could not be found.");
      }

      participant.hasPlayerReady = payload.hasPlayerReady;
      this.io.to(room.roomId).emit(PARTICIPANT_EVENTS.UPDATED, participant);

      if (!payload.hasPlayerReady && room.phase === "countdown") {
        this.cancelCountdown(
          room,
          `${participant.name}'s player became unavailable, so the countdown was cancelled.`
        );
      }

      this.emitRoomState(room);
      this.emitReadyStatus(room);
    } catch (error) {
      this.emitError(socket, error as RoomErrorPayload);
    }
  }

  updateMediaState(socket: Socket, payload: UpdateMediaStatePayload) {
    try {
      const { room, participant } = this.requireSocketContext(socket);
      if (room.roomId !== payload.roomId) {
        throw buildError("ROOM_NOT_FOUND", "That room could not be found.");
      }

      participant.isMicMuted = payload.isMicMuted;
      participant.isCamOff = payload.isCamOff;

      this.io.to(room.roomId).emit(PARTICIPANT_EVENTS.UPDATED, participant);
      this.emitRoomState(room);
    } catch (error) {
      this.emitError(socket, error as RoomErrorPayload);
    }
  }

  setVideo(socket: Socket, payload: SetVideoPayload) {
    try {
      const { room, participant } = this.requireHost(socket, payload.roomId);
      room.playback.videoId = payload.videoId;
      room.playback.status = "paused";
      room.playback.currentTimeSec = 0;
      room.playback.startedAtMs = null;
      room.playback.countdownTargetMs = null;
      room.playback.lastUpdatedBy = participant.userId;
      room.phase = "lobby";

      for (const member of room.participants.values()) {
        member.isReady = false;
        member.hasPlayerReady = false;
        member.isBuffering = false;
      }

      if (room.countdownTimer) {
        clearTimeout(room.countdownTimer);
        room.countdownTimer = null;
      }

      this.io.to(room.roomId).emit(PLAYBACK_EVENTS.VIDEO_SET, {
        roomId: room.roomId,
        videoId: payload.videoId
      });

      const message = this.roomStore.addSystemMessage(room, `${participant.name} picked a new video.`);
      this.emitMessage(room, message);
      this.emitRoomState(room);
      this.emitReadyStatus(room);
    } catch (error) {
      this.emitError(socket, error as RoomErrorPayload);
    }
  }

  startCountdown(socket: Socket, payload: StartCountdownPayload) {
    try {
      const { room, participant } = this.requireHost(socket, payload.roomId);
      const everyoneReady = [...room.participants.values()].every(
        (member) => member.isReady && member.hasPlayerReady
      );

      if (!room.playback.videoId || !everyoneReady) {
        throw buildError(
          "NOT_READY",
          "Everyone must be ready and a video must be loaded before starting."
        );
      }

      const targetStartAtMs = Date.now() + 3000;
      this.setCountdown(room, targetStartAtMs);

      const message = this.roomStore.addSystemMessage(
        room,
        `${participant.name} started the countdown.`
      );
      this.emitMessage(room, message);
      this.emitRoomState(room);
      this.io.to(room.roomId).emit(PLAYBACK_EVENTS.COUNTDOWN_STARTED, {
        roomId: room.roomId,
        targetStartAtMs,
        serverNowMs: Date.now()
      });
      this.emitReadyStatus(room);
    } catch (error) {
      this.emitError(socket, error as RoomErrorPayload);
    }
  }

  play(socket: Socket, payload: PlaybackPlayPayload) {
    try {
      const { room, participant } = this.requireHost(socket, payload.roomId);
      room.phase = "playing";
      room.playback.status = "playing";
      room.playback.startedAtMs = Date.now();
      room.playback.lastUpdatedBy = participant.userId;
      room.playback.countdownTargetMs = null;
      this.emitRoomState(room);
      this.io.to(room.roomId).emit(PLAYBACK_EVENTS.PLAY_NOW, {
        roomId: room.roomId,
        startedAtMs: room.playback.startedAtMs,
        currentTimeSec: room.playback.currentTimeSec,
        serverNowMs: Date.now()
      });
    } catch (error) {
      this.emitError(socket, error as RoomErrorPayload);
    }
  }

  pause(socket: Socket, payload: PlaybackPausePayload) {
    try {
      const { room, participant } = this.requireHost(socket, payload.roomId);
      room.phase = "paused";
      room.playback.status = "paused";
      room.playback.lastUpdatedBy = participant.userId;
      room.playback.startedAtMs = null;
      this.emitRoomState(room);
      this.io.to(room.roomId).emit(PLAYBACK_EVENTS.PAUSED, {
        roomId: room.roomId,
        currentTimeSec: room.playback.currentTimeSec,
        serverNowMs: Date.now()
      });
    } catch (error) {
      this.emitError(socket, error as RoomErrorPayload);
    }
  }

  seek(socket: Socket, payload: PlaybackSeekPayload) {
    try {
      const { room, participant } = this.requireHost(socket, payload.roomId);
      room.playback.currentTimeSec = Math.max(0, payload.currentTimeSec);
      room.playback.lastUpdatedBy = participant.userId;
      room.playback.startedAtMs =
        room.playback.status === "playing" ? Date.now() : room.playback.startedAtMs;
      this.emitRoomState(room);
      this.io.to(room.roomId).emit(PLAYBACK_EVENTS.SEEKED, {
        roomId: room.roomId,
        currentTimeSec: room.playback.currentTimeSec,
        serverNowMs: Date.now()
      });
    } catch (error) {
      this.emitError(socket, error as RoomErrorPayload);
    }
  }

  heartbeat(socket: Socket, payload: PlaybackHeartbeatPayload) {
    try {
      const { room, participant } = this.requireSocketContext(socket);
      if (room.roomId !== payload.roomId) {
        throw buildError("ROOM_NOT_FOUND", "That room could not be found.");
      }

      if (participant.role === "host") {
        room.playback.currentTimeSec = Math.max(0, payload.currentTimeSec);
        room.playback.status =
          payload.playerState === "buffering" ? "playing" : payload.playerState;
        if (payload.playerState === "playing") {
          room.phase = "playing";
          room.playback.startedAtMs = Date.now();
        }
      }

      const delta = Math.abs(room.playback.currentTimeSec - payload.currentTimeSec);
      if (participant.role !== "host" && delta > 0.3) {
        socket.emit(PLAYBACK_EVENTS.SYNC_CORRECTION, {
          roomId: room.roomId,
          currentTimeSec: room.playback.currentTimeSec,
          shouldPlay: room.playback.status === "playing",
          serverNowMs: Date.now(),
          reason: "drift"
        });
      }
    } catch (error) {
      this.emitError(socket, error as RoomErrorPayload);
    }
  }

  handleBuffering(socket: Socket, payload: BufferingPayload) {
    try {
      const { room, participant } = this.requireSocketContext(socket);
      if (room.roomId !== payload.roomId) {
        throw buildError("ROOM_NOT_FOUND", "That room could not be found.");
      }

      participant.isBuffering = payload.isBuffering;
      this.emitRoomState(room);

      if (!payload.isBuffering) {
        return;
      }

      if (room.bufferingPolicy === "pause_all") {
        room.phase = "paused";
        room.playback.status = "paused";
        room.playback.startedAtMs = null;

        const message = this.roomStore.addSystemMessage(
          room,
          `${participant.name} buffered, so playback was paused for everyone.`
        );
        this.emitMessage(room, message);
        this.emitRoomState(room);
        this.io.to(room.roomId).emit(PLAYBACK_EVENTS.PAUSED, {
          roomId: room.roomId,
          currentTimeSec: room.playback.currentTimeSec,
          serverNowMs: Date.now()
        });
        this.io.to(room.roomId).emit(PLAYBACK_EVENTS.POLICY_APPLIED, {
          roomId: room.roomId,
          policy: room.bufferingPolicy,
          affectedUserId: participant.userId,
          action: "pause_all",
          serverNowMs: Date.now()
        });
        return;
      }

      socket.emit(PLAYBACK_EVENTS.SYNC_CORRECTION, {
        roomId: room.roomId,
        currentTimeSec: room.playback.currentTimeSec,
        shouldPlay: room.playback.status === "playing",
        serverNowMs: Date.now(),
        reason: "buffering_recovery"
      });

      const message = this.roomStore.addSystemMessage(
        room,
        `${participant.name} buffered and is being resynced.`
      );
      this.emitMessage(room, message);
      this.io.to(room.roomId).emit(PLAYBACK_EVENTS.POLICY_APPLIED, {
        roomId: room.roomId,
        policy: room.bufferingPolicy,
        affectedUserId: participant.userId,
        action: "resync_self",
        serverNowMs: Date.now()
      });
    } catch (error) {
      this.emitError(socket, error as RoomErrorPayload);
    }
  }

  sendChat(socket: Socket, payload: ChatSendPayload) {
    try {
      const { room, participant } = this.requireSocketContext(socket);
      if (room.roomId !== payload.roomId) {
        throw buildError("ROOM_NOT_FOUND", "That room could not be found.");
      }

      if (!payload.text?.trim()) {
        return;
      }

      const message: ChatMessage = {
        messageId: createMessageId(),
        roomId: room.roomId,
        userId: participant.userId,
        userName: participant.name,
        kind: "text",
        text: payload.text.trim(),
        createdAt: Date.now()
      };
      room.chatHistory.push(message);
      this.emitMessage(room, message);
    } catch (error) {
      this.emitError(socket, error as RoomErrorPayload);
    }
  }

  updateBufferingPolicy(socket: Socket, payload: UpdateBufferingPolicyPayload) {
    try {
      const { room } = this.requireHost(socket, payload.roomId);
      room.bufferingPolicy = payload.policy;
      this.io.to(room.roomId).emit(SETTINGS_EVENTS.UPDATED, {
        roomId: room.roomId,
        bufferingPolicy: room.bufferingPolicy,
        serverNowMs: Date.now()
      });
      const message = this.roomStore.addSystemMessage(
        room,
        `Buffering policy changed to ${payload.policy.replace("_", " ")}.`
      );
      this.emitMessage(room, message);
      this.emitRoomState(room);
    } catch (error) {
      this.emitError(socket, error as RoomErrorPayload);
    }
  }

  muteUser(socket: Socket, payload: HostMuteUserPayload) {
    try {
      const { room, participant } = this.requireHost(socket, payload.roomId);
      const target = [...room.participants.values()].find(
        (member) => member.userId === payload.targetUserId
      );
      if (!target) {
        throw buildError("ROOM_NOT_FOUND", "That participant could not be found.");
      }

      target.isMicMuted = true;
      this.io.to(target.socketId).emit(HOST_EVENTS.USER_MUTED, {
        roomId: room.roomId,
        targetUserId: target.userId,
        byUserId: participant.userId,
        reason: "single"
      });
      this.io.to(room.roomId).emit(PARTICIPANT_EVENTS.UPDATED, target);
      this.emitRoomState(room);

      const message = this.roomStore.addSystemMessage(
        room,
        `${participant.name} muted ${target.name}.`
      );
      this.emitMessage(room, message);
    } catch (error) {
      this.emitError(socket, error as RoomErrorPayload);
    }
  }

  muteAll(socket: Socket, payload: HostMuteAllPayload) {
    try {
      const { room, participant } = this.requireHost(socket, payload.roomId);
      for (const target of room.participants.values()) {
        if (target.userId === participant.userId) {
          continue;
        }

        target.isMicMuted = true;
        this.io.to(target.socketId).emit(HOST_EVENTS.USER_MUTED, {
          roomId: room.roomId,
          targetUserId: target.userId,
          byUserId: participant.userId,
          reason: "all"
        });
      }

      this.io.to(room.roomId).emit(HOST_EVENTS.ALL_MUTED, {
        roomId: room.roomId,
        byUserId: participant.userId
      });
      this.emitRoomState(room);
      const message = this.roomStore.addSystemMessage(
        room,
        `${participant.name} muted everyone.`
      );
      this.emitMessage(room, message);
    } catch (error) {
      this.emitError(socket, error as RoomErrorPayload);
    }
  }

  transferHost(socket: Socket, payload: HostTransferPayload) {
    try {
      const { room } = this.requireHost(socket, payload.roomId);
      const target = [...room.participants.values()].find(
        (member) => member.userId === payload.targetUserId
      );
      if (!target) {
        throw buildError("ROOM_NOT_FOUND", "That participant could not be found.");
      }

      for (const participant of room.participants.values()) {
        participant.role = participant.userId === target.userId ? "host" : "guest";
      }
      room.hostId = target.userId;

      this.io.to(room.roomId).emit(HOST_EVENTS.CHANGED, {
        roomId: room.roomId,
        hostId: target.userId
      });
      const message = this.roomStore.addSystemMessage(room, `${target.name} is now the host.`);
      this.emitMessage(room, message);
      this.emitRoomState(room);
    } catch (error) {
      this.emitError(socket, error as RoomErrorPayload);
    }
  }
}
