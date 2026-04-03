import {
  HOST_EVENTS,
  PARTICIPANT_EVENTS,
  type HostMuteAllPayload,
  type HostMuteUserPayload,
  type HostTransferPayload,
  type SetPlayerReadyPayload,
  type SetReadyPayload,
  type UpdateMediaStatePayload
} from "@syncplayer/shared";
import type { Socket } from "socket.io";

import type { RoomService } from "../services/roomService";

export function registerMediaHandlers(socket: Socket, roomService: RoomService) {
  socket.on(PARTICIPANT_EVENTS.SET_READY, (payload: SetReadyPayload) => {
    roomService.setReady(socket, payload);
  });

  socket.on(PARTICIPANT_EVENTS.SET_PLAYER_READY, (payload: SetPlayerReadyPayload) => {
    roomService.setPlayerReady(socket, payload);
  });

  socket.on(PARTICIPANT_EVENTS.UPDATE_MEDIA_STATE, (payload: UpdateMediaStatePayload) => {
    roomService.updateMediaState(socket, payload);
  });

  socket.on(HOST_EVENTS.MUTE_USER, (payload: HostMuteUserPayload) => {
    roomService.muteUser(socket, payload);
  });

  socket.on(HOST_EVENTS.MUTE_ALL, (payload: HostMuteAllPayload) => {
    roomService.muteAll(socket, payload);
  });

  socket.on(HOST_EVENTS.TRANSFER_HOST, (payload: HostTransferPayload) => {
    roomService.transferHost(socket, payload);
  });
}
