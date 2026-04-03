import { CHAT_EVENTS, type ChatSendPayload } from "@syncplayer/shared";
import type { Socket } from "socket.io";

import type { RoomService } from "../services/roomService";

export function registerChatHandlers(socket: Socket, roomService: RoomService) {
  socket.on(CHAT_EVENTS.SEND, (payload: ChatSendPayload) => {
    roomService.sendChat(socket, payload);
  });
}
