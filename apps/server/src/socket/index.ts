import { Server as HttpServer } from "node:http";

import { Server } from "socket.io";

import { env } from "../config/env";
import { RoomService } from "../services/roomService";
import { RoomStore } from "../stores/roomStore";
import { registerChatHandlers } from "./chatHandlers";
import { registerMediaHandlers } from "./mediaHandlers";
import { registerPlaybackHandlers } from "./playbackHandlers";
import { registerRoomHandlers } from "./roomHandlers";

export function createSocketServer(httpServer: HttpServer, roomStore: RoomStore) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientOrigin,
      credentials: true
    }
  });

  const roomService = new RoomService(io, roomStore);

  io.on("connection", (socket) => {
    registerRoomHandlers(socket, roomService);
    registerChatHandlers(socket, roomService);
    registerPlaybackHandlers(socket, roomService);
    registerMediaHandlers(socket, roomService);

    socket.on("disconnect", () => {
      roomService.leaveRoom(socket);
    });
  });

  return { io, roomService };
}
