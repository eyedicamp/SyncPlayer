export interface ChatMessage {
  messageId: string;
  roomId: string;
  userId: string;
  userName: string;
  kind: "text" | "system";
  text: string;
  createdAt: number;
}

export interface ChatSendPayload {
  roomId: string;
  text: string;
}
