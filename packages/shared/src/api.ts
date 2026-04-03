export interface LiveKitTokenRequest {
  roomId: string;
  participantName: string;
  participantIdentity: string;
}

export interface LiveKitTokenResponse {
  token: string;
  livekitUrl: string;
}
