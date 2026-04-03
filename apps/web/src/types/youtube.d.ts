export {};

declare global {
  interface Window {
    YT?: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }

  namespace YT {
    type PlayerEvent = {
      target: Player;
      data?: number;
    };

    type OnReadyEvent = PlayerEvent;
    type OnStateChangeEvent = PlayerEvent;
    type OnErrorEvent = PlayerEvent;

    interface PlayerOptions {
      videoId?: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: (event: OnReadyEvent) => void;
        onStateChange?: (event: OnStateChangeEvent) => void;
        onError?: (event: OnErrorEvent) => void;
      };
    }

    interface Player {
      cueVideoById(videoId: string): void;
      loadVideoById(videoId: string, startSeconds?: number): void;
      playVideo(): void;
      pauseVideo(): void;
      seekTo(seconds: number, allowSeekAhead: boolean): void;
      getCurrentTime(): number;
      getPlayerState(): number;
      destroy(): void;
    }

    const Player: {
      new (elementId: string | HTMLElement, options?: PlayerOptions): Player;
    };

    const PlayerState: {
      UNSTARTED: -1;
      ENDED: 0;
      PLAYING: 1;
      PAUSED: 2;
      BUFFERING: 3;
      CUED: 5;
    };
  }
}
