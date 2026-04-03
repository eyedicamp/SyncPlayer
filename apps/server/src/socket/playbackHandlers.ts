import {
  PLAYBACK_EVENTS,
  SETTINGS_EVENTS,
  type BufferingPayload,
  type PlaybackHeartbeatPayload,
  type PlaybackPausePayload,
  type PlaybackPlayPayload,
  type PlaybackSeekPayload,
  type SetVideoPayload,
  type StartCountdownPayload,
  type UpdateBufferingPolicyPayload
} from "@syncplayer/shared";
import type { Socket } from "socket.io";

import type { RoomService } from "../services/roomService";

export function registerPlaybackHandlers(socket: Socket, roomService: RoomService) {
  socket.on(PLAYBACK_EVENTS.SET_VIDEO, (payload: SetVideoPayload) => {
    roomService.setVideo(socket, payload);
  });

  socket.on(PLAYBACK_EVENTS.START_COUNTDOWN, (payload: StartCountdownPayload) => {
    roomService.startCountdown(socket, payload);
  });

  socket.on(PLAYBACK_EVENTS.PLAY, (payload: PlaybackPlayPayload) => {
    roomService.play(socket, payload);
  });

  socket.on(PLAYBACK_EVENTS.PAUSE, (payload: PlaybackPausePayload) => {
    roomService.pause(socket, payload);
  });

  socket.on(PLAYBACK_EVENTS.SEEK, (payload: PlaybackSeekPayload) => {
    roomService.seek(socket, payload);
  });

  socket.on(PLAYBACK_EVENTS.HEARTBEAT, (payload: PlaybackHeartbeatPayload) => {
    roomService.heartbeat(socket, payload);
  });

  socket.on(PLAYBACK_EVENTS.BUFFERING, (payload: BufferingPayload) => {
    roomService.handleBuffering(socket, payload);
  });

  socket.on(SETTINGS_EVENTS.UPDATE_BUFFERING_POLICY, (payload: UpdateBufferingPolicyPayload) => {
    roomService.updateBufferingPolicy(socket, payload);
  });
}
