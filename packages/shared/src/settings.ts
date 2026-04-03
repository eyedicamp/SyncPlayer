import type { BufferingPolicy } from "./room";

export interface UpdateBufferingPolicyPayload {
  roomId: string;
  policy: BufferingPolicy;
}

export interface SettingsUpdatedPayload {
  roomId: string;
  bufferingPolicy: BufferingPolicy;
  serverNowMs: number;
}
