import { AccessToken } from "livekit-server-sdk";

import type { LiveKitTokenRequest, LiveKitTokenResponse } from "@syncplayer/shared";

import { env } from "../config/env";

export class LiveKitTokenService {
  isConfigured() {
    return Boolean(env.livekitApiKey && env.livekitApiSecret && env.livekitUrl);
  }

  async createToken(request: LiveKitTokenRequest): Promise<LiveKitTokenResponse> {
    if (!this.isConfigured()) {
      throw new Error("LiveKit is not configured.");
    }

    const token = new AccessToken(env.livekitApiKey, env.livekitApiSecret, {
      identity: request.participantIdentity,
      name: request.participantName
    });

    token.addGrant({
      roomJoin: true,
      room: request.roomId,
      canPublish: true,
      canSubscribe: true
    });

    return {
      token: await token.toJwt(),
      livekitUrl: env.livekitUrl
    };
  }
}
