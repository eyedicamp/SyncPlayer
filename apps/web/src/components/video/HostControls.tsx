"use client";

import { Button } from "../common/Button";

export function HostControls({
  onMuteAll
}: {
  onMuteAll: () => Promise<void>;
}) {
  return (
    <div className="rounded-3xl border border-white/8 bg-black/16 p-4">
      <p className="text-sm font-medium text-white">Host controls</p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Muting is enforced through the room server and reflected in the local media state.
      </p>
      <div className="mt-4">
        <Button variant="danger" onClick={() => void onMuteAll()}>
          Mute everyone
        </Button>
      </div>
    </div>
  );
}
