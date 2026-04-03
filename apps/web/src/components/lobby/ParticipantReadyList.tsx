import type { Participant } from "@syncplayer/shared";

export function ParticipantReadyList({
  participants,
  meId
}: {
  participants: Participant[];
  meId: string | null;
}) {
  return (
    <div className="space-y-3">
      {participants.map((participant) => {
        const stateLabel = participant.isReady
          ? participant.hasPlayerReady
            ? "Ready"
            : "Waiting for player"
          : "Not ready";

        return (
          <div
            key={participant.userId}
            className="flex items-center justify-between rounded-3xl border border-white/8 bg-black/16 px-4 py-4"
          >
            <div>
              <p className="font-medium text-white">
                {participant.name}
                {participant.userId === meId ? " (you)" : ""}
              </p>
              <p className="text-sm text-[var(--muted)]">{participant.role}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white">{stateLabel}</p>
              <p className="text-xs text-[var(--muted)]">
                mic {participant.isMicMuted ? "muted" : "live"} · cam{" "}
                {participant.isCamOff ? "off" : "on"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
