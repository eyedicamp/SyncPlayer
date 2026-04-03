import { Badge } from "../common/Badge";
import { InviteButton } from "./InviteButton";

export function RoomHeader({
  roomId,
  participantCount,
  isHost
}: {
  roomId: string;
  participantCount: number;
  isHost: boolean;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
      <div className="space-y-2">
        <Badge>Room {roomId}</Badge>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Watch together without losing the beat.
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {participantCount} participant{participantCount === 1 ? "" : "s"} connected
            {isHost ? " · you are hosting" : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isHost ? <Badge className="text-[var(--accent)]">Host</Badge> : null}
        <InviteButton roomId={roomId} />
      </div>
    </header>
  );
}
