"use client";

import { useRef, useState } from "react";

import { parseYouTubeVideoId } from "../../lib/youtube";
import { Button } from "../common/Button";

export function YouTubeUrlForm({
  currentVideoId,
  disabled,
  onSubmit
}: {
  currentVideoId: string | null;
  disabled?: boolean;
  onSubmit: (videoId: string) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const defaultValue = currentVideoId ? `https://www.youtube.com/watch?v=${currentVideoId}` : "";

  return (
    <form
      key={currentVideoId ?? "empty"}
      className="flex flex-col gap-3 md:flex-row"
      onSubmit={async (event) => {
        event.preventDefault();
        const videoId = parseYouTubeVideoId(inputRef.current?.value ?? "");
        if (!videoId) {
          setError("Paste a valid YouTube URL or 11-character video ID.");
          return;
        }

        setError(null);
        await onSubmit(videoId);
      }}
    >
      <div className="flex-1">
        <input
          ref={inputRef}
          defaultValue={defaultValue}
          disabled={disabled}
          className="w-full rounded-full border border-white/10 bg-black/20 px-4 py-3 outline-none placeholder:text-white/28 disabled:opacity-60"
          placeholder="Paste a YouTube URL"
        />
        {error ? <p className="mt-2 text-sm text-[var(--danger)]">{error}</p> : null}
      </div>
      <Button type="submit" disabled={disabled}>
        Load video
      </Button>
    </form>
  );
}
