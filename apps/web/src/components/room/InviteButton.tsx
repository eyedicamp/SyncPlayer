"use client";

import { useState } from "react";

import { Button } from "../common/Button";

export function InviteButton({ roomId }: { roomId: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? "Invite copied" : "Copy invite"}
    </Button>
  );
}
