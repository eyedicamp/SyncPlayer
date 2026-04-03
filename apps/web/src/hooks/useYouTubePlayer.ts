"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type PlayerPhase = "idle" | "paused" | "playing" | "buffering" | "error";

let scriptPromise: Promise<void> | null = null;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

type ReadyYouTubePlayer = YT.Player & {
  cueVideoById(videoId: string): void;
  loadVideoById(videoId: string, startSeconds?: number): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
};

function hasReadyPlayerApi(player: YT.Player | null): player is ReadyYouTubePlayer {
  return Boolean(
    player &&
      typeof player.cueVideoById === "function" &&
      typeof player.loadVideoById === "function" &&
      typeof player.playVideo === "function" &&
      typeof player.pauseVideo === "function" &&
      typeof player.seekTo === "function" &&
      typeof player.getCurrentTime === "function"
  );
}

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
  const pendingVideoIdRef = useRef<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [phase, setPhase] = useState<PlayerPhase>("idle");
  const [currentTimeSec, setCurrentTimeSec] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncCurrentTimeFromPlayer = useCallback(() => {
    if (!hasReadyPlayerApi(playerRef.current)) {
      return null;
    }

    const nextCurrentTimeSec = playerRef.current.getCurrentTime();
    if (!isFiniteNumber(nextCurrentTimeSec)) {
      return null;
    }

    setCurrentTimeSec(nextCurrentTimeSec);
    return nextCurrentTimeSec;
  }, []);

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
            setCurrentTimeSec(0);
            setIsReady(true);
            if (pendingVideoIdRef.current && hasReadyPlayerApi(playerRef.current)) {
              playerRef.current.cueVideoById(pendingVideoIdRef.current);
              pendingVideoIdRef.current = null;
            }
            readyChangeRef.current(true);
          },
          onStateChange: (event) => {
            syncCurrentTimeFromPlayer();
            switch (event.data) {
              case window.YT.PlayerState.PLAYING:
                setPhase("playing");
                setError(null);
                bufferingChangeRef.current(false);
                readyChangeRef.current(true);
                break;
              case window.YT.PlayerState.PAUSED:
              case window.YT.PlayerState.CUED:
                setPhase("paused");
                setError(null);
                bufferingChangeRef.current(false);
                readyChangeRef.current(true);
                break;
              case window.YT.PlayerState.BUFFERING:
                setPhase("buffering");
                setError(null);
                bufferingChangeRef.current(true);
                break;
              default:
                break;
            }
          },
          onError: () => {
            setPhase("error");
            setError("YouTube could not load this video.");
            setCurrentTimeSec(null);
            setIsReady(false);
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
  }, [syncCurrentTimeFromPlayer]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      syncCurrentTimeFromPlayer();
    }, 500);

    return () => window.clearInterval(interval);
  }, [syncCurrentTimeFromPlayer]);

  const cueVideo = useCallback((videoId: string) => {
    readyChangeRef.current(false);
    setCurrentTimeSec(0);
    setError(null);
    pendingVideoIdRef.current = videoId;
    if (!hasReadyPlayerApi(playerRef.current)) {
      return false;
    }

    playerRef.current.cueVideoById(videoId);
    pendingVideoIdRef.current = null;
    return true;
  }, []);

  const loadVideo = useCallback((videoId: string, startSeconds = 0) => {
    readyChangeRef.current(false);
    setCurrentTimeSec(startSeconds);
    setError(null);
    pendingVideoIdRef.current = videoId;
    if (!hasReadyPlayerApi(playerRef.current)) {
      return false;
    }

    playerRef.current.loadVideoById(videoId, startSeconds);
    pendingVideoIdRef.current = null;
    return true;
  }, []);

  const play = useCallback(() => {
    if (!hasReadyPlayerApi(playerRef.current)) {
      return false;
    }

    playerRef.current.playVideo();
    return true;
  }, []);

  const pause = useCallback(() => {
    if (!hasReadyPlayerApi(playerRef.current)) {
      return false;
    }

    playerRef.current.pauseVideo();
    return true;
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const nextTimeSec = Math.max(0, seconds);
    setCurrentTimeSec(nextTimeSec);
    if (!hasReadyPlayerApi(playerRef.current)) {
      return false;
    }

    playerRef.current.seekTo(nextTimeSec, true);
    return true;
  }, []);

  return {
    containerRef,
    phase,
    currentTimeSec,
    error,
    isReady,
    cueVideo,
    loadVideo,
    play,
    pause,
    seekTo
  };
}
