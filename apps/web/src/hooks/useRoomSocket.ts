"use client";

import { useEffect, useEffectEvent, useMemo, useState } from "react";

import {
  CHAT_EVENTS,
  HOST_EVENTS,
  PLAYBACK_EVENTS,
  ROOM_EVENTS,
  SETTINGS_EVENTS,
  type BufferingPolicy,
  type ChatMessage,
  type CountdownStartedPayload,
  type HostMutedPayload,
  type PlayNowPayload,
  type PlaybackPolicyAppliedPayload,
  type RoomErrorPayload,
  type RoomSnapshotPayload,
  type RoomState,
  type SettingsUpdatedPayload,
  type SyncCorrectionPayload
} from "@syncplayer/shared";

import { ensureSocketConnected, getSocket } from "../lib/socket";
import { useChatStore } from "../store/chatStore";
import { useMediaStore } from "../store/mediaStore";
import { useRoomStore } from "../store/roomStore";
import { useSessionStore } from "../store/sessionStore";
import { useUiStore } from "../store/uiStore";

type TimedEvent<T> = T & { eventKey: number };

export function useRoomSocket(roomId: string) {
  const { room, me } = useRoomStore();
  const userName = useSessionStore((state) => state.userName);
  const ensureSessionId = useSessionStore((state) => state.ensureSessionId);
  const applySnapshot = useRoomStore((state) => state.applySnapshot);
  const setRoom = useRoomStore((state) => state.setRoom);
  const setConnectionState = useRoomStore((state) => state.setConnectionState);
  const setError = useRoomStore((state) => state.setError);
  const setMessages = useChatStore((state) => state.setMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const setSyncOffsetMs = useMediaStore((state) => state.setSyncOffsetMs);
  const setMicMuted = useMediaStore((state) => state.setMicMuted);
  const setCamOff = useMediaStore((state) => state.setCamOff);
  const setCountdownTargetMs = useUiStore((state) => state.setCountdownTargetMs);
  const setSyncNotice = useUiStore((state) => state.setSyncNotice);

  const [countdownEvent, setCountdownEvent] = useState<TimedEvent<CountdownStartedPayload> | null>(
    null
  );
  const [playEvent, setPlayEvent] = useState<TimedEvent<PlayNowPayload> | null>(null);
  const [pauseEvent, setPauseEvent] = useState<TimedEvent<{ currentTimeSec: number }> | null>(null);
  const [seekEvent, setSeekEvent] = useState<TimedEvent<{ currentTimeSec: number }> | null>(null);
  const [syncCorrection, setSyncCorrection] =
    useState<TimedEvent<SyncCorrectionPayload> | null>(null);
  const [hostMuteEvent, setHostMuteEvent] = useState<TimedEvent<HostMutedPayload> | null>(null);

  const syncSnapshot = useEffectEvent((snapshot: RoomSnapshotPayload) => {
    applySnapshot(snapshot);
    setMessages(snapshot.chatHistory);
    setSyncOffsetMs(snapshot.serverNowMs - Date.now());
    setMicMuted(snapshot.me.isMicMuted);
    setCamOff(snapshot.me.isCamOff);
    setError(null);
  });

  const joinCurrentRoom = useEffectEvent(async () => {
    if (!userName.trim()) {
      return;
    }

    const socket = await ensureSocketConnected();
    const sessionId = ensureSessionId();
    const normalizedRoomId = roomId.toUpperCase();

    if (useRoomStore.getState().room?.roomId === normalizedRoomId) {
      socket.emit(ROOM_EVENTS.GET_STATE, { roomId: normalizedRoomId });
      return;
    }

    socket.emit(ROOM_EVENTS.JOIN, {
      roomId: normalizedRoomId,
      userName,
      sessionId
    });
  });

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      setConnectionState("connected");
      void joinCurrentRoom();
    };

    const handleDisconnect = () => {
      setConnectionState("disconnected");
      setSyncNotice("Connection lost. Reconnecting...");
    };

    const handleJoined = (snapshot: RoomSnapshotPayload) => {
      syncSnapshot(snapshot);
      setSyncNotice(null);
    };

    const handleState = (nextRoom: RoomState) => {
      setRoom(nextRoom);
      const nextMe = nextRoom.participants.find(
        (participant) => participant.userId === useRoomStore.getState().me?.userId
      );
      if (nextMe) {
        setMicMuted(nextMe.isMicMuted);
        setCamOff(nextMe.isCamOff);
      }
    };

    const handleError = (payload: RoomErrorPayload) => {
      setError(payload.message);
    };

    const handleMessage = (message: ChatMessage) => {
      addMessage(message);
    };

    const handleCountdown = (payload: CountdownStartedPayload) => {
      setCountdownTargetMs(payload.targetStartAtMs);
      setCountdownEvent({ ...payload, eventKey: Date.now() });
    };

    const handlePlay = (payload: PlayNowPayload) => {
      setCountdownTargetMs(null);
      setPlayEvent({ ...payload, eventKey: Date.now() });
    };

    const handlePause = (payload: { currentTimeSec: number }) => {
      setPauseEvent({ ...payload, eventKey: Date.now() });
    };

    const handleSeek = (payload: { currentTimeSec: number }) => {
      setSeekEvent({ ...payload, eventKey: Date.now() });
    };

    const handleCorrection = (payload: SyncCorrectionPayload) => {
      setSyncNotice(
        payload.reason === "buffering_recovery"
          ? "Recovering from buffering..."
          : "Applying sync correction..."
      );
      setSyncCorrection({ ...payload, eventKey: Date.now() });
      window.setTimeout(() => setSyncNotice(null), 1400);
    };

    const handleHostMuted = (payload: HostMutedPayload) => {
      if (payload.targetUserId !== ensureSessionId()) {
        return;
      }

      setMicMuted(true);
      setHostMuteEvent({ ...payload, eventKey: Date.now() });
    };

    const handlePolicyApplied = (payload: PlaybackPolicyAppliedPayload) => {
      const label =
        payload.action === "pause_all"
          ? "Playback paused because someone buffered."
          : "A participant is being resynced after buffering.";
      setSyncNotice(label);
      window.setTimeout(() => setSyncNotice(null), 2400);
    };

    const handleSettingsUpdated = (payload: SettingsUpdatedPayload) => {
      const currentRoom = useRoomStore.getState().room;
      if (!currentRoom || currentRoom.roomId !== payload.roomId) {
        return;
      }

      setRoom({ ...currentRoom, bufferingPolicy: payload.bufferingPolicy as BufferingPolicy });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on(ROOM_EVENTS.JOINED, handleJoined);
    socket.on(ROOM_EVENTS.STATE, handleState);
    socket.on(ROOM_EVENTS.ERROR, handleError);
    socket.on(CHAT_EVENTS.MESSAGE, handleMessage);
    socket.on(PLAYBACK_EVENTS.COUNTDOWN_STARTED, handleCountdown);
    socket.on(PLAYBACK_EVENTS.PLAY_NOW, handlePlay);
    socket.on(PLAYBACK_EVENTS.PAUSED, handlePause);
    socket.on(PLAYBACK_EVENTS.SEEKED, handleSeek);
    socket.on(PLAYBACK_EVENTS.SYNC_CORRECTION, handleCorrection);
    socket.on(HOST_EVENTS.USER_MUTED, handleHostMuted);
    socket.on(PLAYBACK_EVENTS.POLICY_APPLIED, handlePolicyApplied);
    socket.on(SETTINGS_EVENTS.UPDATED, handleSettingsUpdated);

    setConnectionState(socket.connected ? "connected" : "connecting");
    void ensureSocketConnected().then(handleConnect).catch(() => {
      setConnectionState("disconnected");
      setError("Could not connect to the SyncPlayer server.");
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off(ROOM_EVENTS.JOINED, handleJoined);
      socket.off(ROOM_EVENTS.STATE, handleState);
      socket.off(ROOM_EVENTS.ERROR, handleError);
      socket.off(CHAT_EVENTS.MESSAGE, handleMessage);
      socket.off(PLAYBACK_EVENTS.COUNTDOWN_STARTED, handleCountdown);
      socket.off(PLAYBACK_EVENTS.PLAY_NOW, handlePlay);
      socket.off(PLAYBACK_EVENTS.PAUSED, handlePause);
      socket.off(PLAYBACK_EVENTS.SEEKED, handleSeek);
      socket.off(PLAYBACK_EVENTS.SYNC_CORRECTION, handleCorrection);
      socket.off(HOST_EVENTS.USER_MUTED, handleHostMuted);
      socket.off(PLAYBACK_EVENTS.POLICY_APPLIED, handlePolicyApplied);
      socket.off(SETTINGS_EVENTS.UPDATED, handleSettingsUpdated);
    };
  }, [
    addMessage,
    ensureSessionId,
    setCamOff,
    setConnectionState,
    setCountdownTargetMs,
    setError,
    setMicMuted,
    setRoom,
    setSyncNotice,
    setSyncOffsetMs
  ]);

  const emitters = useMemo(
    () => ({
      async setReady(isReady: boolean) {
        const socket = await ensureSocketConnected();
        socket.emit("participant:set_ready", { roomId: roomId.toUpperCase(), isReady });
      },
      async setPlayerReady(hasPlayerReady: boolean) {
        const socket = await ensureSocketConnected();
        socket.emit("participant:set_player_ready", {
          roomId: roomId.toUpperCase(),
          hasPlayerReady
        });
      },
      async updateMediaState(nextState: { isMicMuted: boolean; isCamOff: boolean }) {
        const socket = await ensureSocketConnected();
        socket.emit("participant:update_media_state", {
          roomId: roomId.toUpperCase(),
          ...nextState
        });
      },
      async setVideo(videoId: string) {
        const socket = await ensureSocketConnected();
        socket.emit("playback:set_video", { roomId: roomId.toUpperCase(), videoId });
      },
      async startCountdown() {
        const socket = await ensureSocketConnected();
        socket.emit("playback:start_countdown", { roomId: roomId.toUpperCase() });
      },
      async play() {
        const socket = await ensureSocketConnected();
        socket.emit("playback:play", { roomId: roomId.toUpperCase() });
      },
      async pause() {
        const socket = await ensureSocketConnected();
        socket.emit("playback:pause", { roomId: roomId.toUpperCase() });
      },
      async seek(currentTimeSec: number) {
        const socket = await ensureSocketConnected();
        socket.emit("playback:seek", { roomId: roomId.toUpperCase(), currentTimeSec });
      },
      async heartbeat(currentTimeSec: number, playerState: "playing" | "paused" | "buffering") {
        const socket = await ensureSocketConnected();
        socket.emit("playback:heartbeat", {
          roomId: roomId.toUpperCase(),
          currentTimeSec,
          playerState,
          sentAtMs: Date.now()
        });
      },
      async buffering(isBuffering: boolean) {
        const socket = await ensureSocketConnected();
        socket.emit("playback:buffering", { roomId: roomId.toUpperCase(), isBuffering });
      },
      async updateBufferingPolicy(policy: BufferingPolicy) {
        const socket = await ensureSocketConnected();
        socket.emit("settings:update_buffering_policy", {
          roomId: roomId.toUpperCase(),
          policy
        });
      },
      async sendChat(text: string) {
        const socket = await ensureSocketConnected();
        socket.emit("chat:send", { roomId: roomId.toUpperCase(), text });
      },
      async muteUser(targetUserId: string) {
        const socket = await ensureSocketConnected();
        socket.emit("host:mute_user", { roomId: roomId.toUpperCase(), targetUserId });
      },
      async muteAll() {
        const socket = await ensureSocketConnected();
        socket.emit("host:mute_all", { roomId: roomId.toUpperCase() });
      },
      async transferHost(targetUserId: string) {
        const socket = await ensureSocketConnected();
        socket.emit("host:transfer_host", { roomId: roomId.toUpperCase(), targetUserId });
      }
    }),
    [roomId]
  );

  return {
    room,
    me,
    userName,
    countdownEvent,
    playEvent,
    pauseEvent,
    seekEvent,
    syncCorrection,
    hostMuteEvent,
    ...emitters
  };
}
