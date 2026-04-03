"use client";

import { Button } from "../common/Button";

export function LocalControls({
  status,
  isMicMuted,
  isCamOff,
  onConnect,
  onDisconnect,
  onToggleMic,
  onToggleCam
}: {
  status: "idle" | "connecting" | "connected" | "error";
  isMicMuted: boolean;
  isCamOff: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onToggleMic: () => Promise<void>;
  onToggleCam: () => Promise<void>;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {status === "connected" ? (
        <Button variant="secondary" onClick={() => void onDisconnect()}>
          Leave call
        </Button>
      ) : (
        <Button onClick={() => void onConnect()} disabled={status === "connecting"}>
          {status === "connecting" ? "Connecting…" : "Connect call"}
        </Button>
      )}
      <Button variant="secondary" disabled={status !== "connected"} onClick={() => void onToggleMic()}>
        {isMicMuted ? "Unmute mic" : "Mute mic"}
      </Button>
      <Button variant="secondary" disabled={status !== "connected"} onClick={() => void onToggleCam()}>
        {isCamOff ? "Turn camera on" : "Turn camera off"}
      </Button>
    </div>
  );
}
