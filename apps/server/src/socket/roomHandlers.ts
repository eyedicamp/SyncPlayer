import {
  ROOM_EVENTS,
  type RoomCreatePayload,
  type RoomGetStatePayload,
  type RoomJoinPayload,
  type RoomLeavePayload
} from "@syncplayer/shared";
import type { Socket } from "socket.io";

import type { RoomService } from "../services/roomService";

export function registerRoomHandlers(socket: Socket, roomService: RoomService) {
  socket.on(ROOM_EVENTS.CREATE, (payload: RoomCreatePayload) => {
    roomService.createRoom(socket, payload);
  });

  socket.on(ROOM_EVENTS.JOIN, (payload: RoomJoinPayload) => {
    roomService.joinRoom(socket, payload);
  });

  socket.on(ROOM_EVENTS.LEAVE, (payload: RoomLeavePayload) => {
    roomService.leaveRoom(socket, payload);
  });

  socket.on(ROOM_EVENTS.GET_STATE, (payload: RoomGetStatePayload) => {
    roomService.getState(socket, payload);
  });
}
