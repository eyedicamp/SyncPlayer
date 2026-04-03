import type { BufferingPolicy, RoomPhase } from "@syncplayer/shared";

import { Badge } from "../common/Badge";

export function RoomStatusBar({
  phase,
  connectionState,
  bufferingPolicy,
  readyText,
  syncNotice
}: {
  phase: RoomPhase;
  connectionState: "disconnected" | "connecting" | "connected";
  bufferingPolicy: BufferingPolicy;
  readyText: string;
  syncNotice: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-white/8 px-5 py-4 text-sm lg:px-6">
      <Badge>{phase}</Badge>
      <Badge>{connectionState}</Badge>
      <Badge>Buffering: {bufferingPolicy.replace("_", " ")}</Badge>
      <span className="text-[var(--muted)]">{readyText}</span>
      {syncNotice ? <span className="text-[var(--accent)]">{syncNotice}</span> : null}
    </div>
  );
}
