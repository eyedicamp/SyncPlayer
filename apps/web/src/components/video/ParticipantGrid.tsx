import type { Participant } from "@syncplayer/shared";

import type { CallParticipant } from "../../hooks/useLiveKitRoom";
import { ParticipantTile } from "./ParticipantTile";

export function ParticipantGrid({
  participants,
  liveParticipants,
  meId,
  isHost,
  onMute,
  onTransferHost
}: {
  participants: Participant[];
  liveParticipants: CallParticipant[];
  meId: string | null;
  isHost: boolean;
  onMute: (userId: string) => void;
  onTransferHost: (userId: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {participants.map((participant) => (
        <ParticipantTile
          key={participant.userId}
          participant={participant}
          liveParticipant={liveParticipants.find(
            (liveParticipant) => liveParticipant.identity === participant.userId
          )}
          isHost={isHost}
          isMe={participant.userId === meId}
          onMute={() => onMute(participant.userId)}
          onTransferHost={() => onTransferHost(participant.userId)}
        />
      ))}
    </div>
  );
}
