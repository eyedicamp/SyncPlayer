import type { RoomState } from "@syncplayer/shared";

import { Badge } from "../common/Badge";

export function SyncStatusBadge({
  roomPhase,
  playerPhase,
  currentTimeSec
}: {
  roomPhase: RoomState["phase"];
  playerPhase: "idle" | "paused" | "playing" | "buffering" | "error";
  currentTimeSec: number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>Room {roomPhase}</Badge>
      <Badge>Player {playerPhase}</Badge>
      <Badge>{currentTimeSec.toFixed(1)}s</Badge>
    </div>
  );
}
