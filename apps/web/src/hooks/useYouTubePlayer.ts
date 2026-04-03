"use client";

import { useEffect, useRef, useState } from "react";

type PlayerPhase = "idle" | "paused" | "playing" | "buffering" | "error";

let scriptPromise: Promise<void> | null = null;

function loadYouTubeApi() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src="https://www.youtube.com/iframe_api"]'
      );

      if (existingScript) {
        window.onYouTubeIframeAPIReady = () => resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      window.onYouTubeIframeAPIReady = () => resolve();
      document.body.appendChild(script);
    });
  }

  return scriptPromise;
}

export function useYouTubePlayer({
  onReadyChange,
  onBufferingChange
}: {
  onReadyChange: (value: boolean) => void;
  onBufferingChange: (value: boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const readyChangeRef = useRef(onReadyChange);
  const bufferingChangeRef = useRef(onBufferingChange);
  const [phase, setPhase] = useState<PlayerPhase>("idle");
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    readyChangeRef.current = onReadyChange;
  }, [onReadyChange]);

  useEffect(() => {
    bufferingChangeRef.current = onBufferingChange;
  }, [onBufferingChange]);

  useEffect(() => {
    let cancelled = false;

    void loadYouTubeApi().then(() => {
      if (cancelled || !containerRef.current || playerRef.current) {
        return;
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        playerVars: {
          autoplay: 0,
          controls: 0,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3
        },
        events: {
          onReady: () => {
            setPhase("paused");
            setError(null);
            readyChangeRef.current(true);
          },
          onStateChange: (event) => {
            switch (event.data) {
              case window.YT.PlayerState.PLAYING:
                setPhase("playing");
                bufferingChangeRef.current(false);
                break;
              case window.YT.PlayerState.PAUSED:
              case window.YT.PlayerState.CUED:
                setPhase("paused");
                bufferingChangeRef.current(false);
                break;
              case window.YT.PlayerState.BUFFERING:
                setPhase("buffering");
                bufferingChangeRef.current(true);
                break;
              default:
                break;
            }
          },
          onError: () => {
            setPhase("error");
            setError("YouTube could not load this video.");
            readyChangeRef.current(false);
          }
        }
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!playerRef.current) {
        return;
      }

      setCurrentTimeSec(playerRef.current.getCurrentTime());
    }, 500);

    return () => window.clearInterval(interval);
  }, []);

  return {
    containerRef,
    phase,
    currentTimeSec,
    error,
    cueVideo(videoId: string) {
      readyChangeRef.current(false);
      playerRef.current?.cueVideoById(videoId);
    },
    loadVideo(videoId: string, startSeconds = 0) {
      readyChangeRef.current(false);
      playerRef.current?.loadVideoById(videoId, startSeconds);
    },
    play() {
      playerRef.current?.playVideo();
    },
    pause() {
      playerRef.current?.pauseVideo();
    },
    seekTo(seconds: number) {
      playerRef.current?.seekTo(Math.max(0, seconds), true);
    }
  };
}
