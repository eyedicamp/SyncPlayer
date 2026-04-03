"use client";

import { io, type Socket } from "socket.io-client";

let socketSingleton: Socket | null = null;

export function getSocket() {
  if (typeof window === "undefined") {
    throw new Error("Socket can only be created in the browser.");
  }

  if (!socketSingleton) {
    socketSingleton = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4001", {
      autoConnect: false,
      transports: ["websocket"]
    });
  }

  return socketSingleton;
}

export async function ensureSocketConnected() {
  const socket = getSocket();
  if (socket.connected) {
    return socket;
  }

  return new Promise<Socket>((resolve, reject) => {
    const handleConnect = () => {
      cleanup();
      resolve(socket);
    };

    const handleError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleError);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleError);
    socket.connect();
  });
}

export async function waitForSocketEvent<T>(
  successEvent: string,
  errorEvent = "room:error"
) {
  const socket = await ensureSocketConnected();

  return new Promise<T>((resolve, reject) => {
    const handleSuccess = (payload: T) => {
      cleanup();
      resolve(payload);
    };

    const handleError = (payload: { message?: string }) => {
      cleanup();
      reject(new Error(payload.message ?? "A realtime error occurred."));
    };

    const cleanup = () => {
      socket.off(successEvent, handleSuccess);
      socket.off(errorEvent, handleError);
    };

    socket.on(successEvent, handleSuccess);
    socket.on(errorEvent, handleError);
  });
}
