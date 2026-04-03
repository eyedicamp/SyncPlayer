import cors from "cors";
import express from "express";

import type { LiveKitTokenRequest } from "@syncplayer/shared";

import { env } from "./config/env";
import { LiveKitTokenService } from "./services/livekitTokenService";
import { RoomStore } from "./stores/roomStore";

export function createApp(roomStore: RoomStore) {
  const app = express();
  const liveKitTokenService = new LiveKitTokenService();

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true
    })
  );
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ ok: true, now: Date.now() });
  });

  app.post(
    "/api/livekit/token",
    async (request: express.Request<object, object, LiveKitTokenRequest>, response) => {
      const { roomId, participantIdentity, participantName } = request.body;

      if (!roomId || !participantIdentity || !participantName) {
        response.status(400).json({
          message: "roomId, participantIdentity, and participantName are required."
        });
        return;
      }

      if (!roomStore.getRoom(roomId.toUpperCase())) {
        response.status(404).json({ message: "Room not found." });
        return;
      }

      try {
        response.json(
          await liveKitTokenService.createToken({
            roomId: roomId.toUpperCase(),
            participantIdentity,
            participantName
          })
        );
      } catch (error) {
        response.status(503).json({
          message:
            error instanceof Error ? error.message : "LiveKit token generation is unavailable."
        });
      }
    }
  );

  return app;
}
