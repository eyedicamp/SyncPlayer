"use client";

import {
  LocalParticipant,
  LocalAudioTrack,
  LocalVideoTrack,
  RemoteParticipant,
  RemoteAudioTrack,
  RemoteVideoTrack,
  Room,
  RoomEvent,
  Track,
  TrackPublication
} from "livekit-client";
import { useRef, useState } from "react";

type CallVideoTrack = LocalVideoTrack | RemoteVideoTrack | null;
type CallAudioTrack = LocalAudioTrack | RemoteAudioTrack | null;

export type CallParticipant = {
  identity: string;
  name: string;
  isLocal: boolean;
  videoTrack: CallVideoTrack;
  audioTrack: CallAudioTrack;
  isMicrophoneEnabled: boolean;
  isCameraEnabled: boolean;
};

function mapParticipant(
  participant: LocalParticipant | RemoteParticipant
): CallParticipant {
  const publications = [
    ...((participant.trackPublications.values() as unknown) as Iterable<TrackPublication>)
  ];
  const videoTrack =
    (publications.find((publication) => publication.source === Track.Source.Camera)?.track as
      | LocalVideoTrack
      | RemoteVideoTrack
      | undefined) ?? null;
  const audioTrack =
    (publications.find((publication) => publication.source === Track.Source.Microphone)?.track as
      | LocalAudioTrack
      | RemoteAudioTrack
      | undefined) ?? null;

  return {
    identity: participant.identity,
    name: participant.name || participant.identity,
    isLocal: participant.isLocal,
    videoTrack,
    audioTrack,
    isMicrophoneEnabled: participant.isMicrophoneEnabled,
    isCameraEnabled: participant.isCameraEnabled
  };
}

export function useLiveKitRoom({
  roomId,
  participantIdentity,
  participantName
}: {
  roomId: string;
  participantIdentity: string;
  participantName: string;
}) {
  const roomRef = useRef<Room | null>(null);
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const syncParticipants = () => {
    const room = roomRef.current;
    if (!room) {
      setParticipants([]);
      return;
    }

    setParticipants([
      mapParticipant(room.localParticipant),
      ...Array.from(room.remoteParticipants.values()).map((participant) => mapParticipant(participant))
    ]);
  };

  const connect = async () => {
    if (roomRef.current) {
      syncParticipants();
      return;
    }

    setStatus("connecting");
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001"}/api/livekit/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            participantIdentity,
            participantName
          })
        }
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message ?? "Could not join the LiveKit room.");
      }

      const payload = (await response.json()) as {
        token: string;
        livekitUrl: string;
      };
      const room = new Room();
      roomRef.current = room;

      const resync = () => {
        syncParticipants();
      };

      room
        .on(RoomEvent.ParticipantConnected, resync)
        .on(RoomEvent.ParticipantDisconnected, resync)
        .on(RoomEvent.TrackSubscribed, resync)
        .on(RoomEvent.TrackUnsubscribed, resync)
        .on(RoomEvent.LocalTrackPublished, resync)
        .on(RoomEvent.LocalTrackUnpublished, resync)
        .on(RoomEvent.TrackMuted, resync)
        .on(RoomEvent.TrackUnmuted, resync)
        .on(RoomEvent.Disconnected, () => {
          roomRef.current = null;
          setParticipants([]);
          setStatus("idle");
        });

      await room.connect(payload.livekitUrl, payload.token);
      syncParticipants();
      setStatus("connected");
    } catch (nextError) {
      roomRef.current = null;
      setStatus("error");
      setError(nextError instanceof Error ? nextError.message : "LiveKit connection failed.");
    }
  };

  const disconnect = async () => {
    await roomRef.current?.disconnect();
    roomRef.current = null;
    setParticipants([]);
    setStatus("idle");
  };

  const setMicrophoneEnabled = async (enabled: boolean) => {
    if (!roomRef.current) {
      return false;
    }

    try {
      await roomRef.current.localParticipant.setMicrophoneEnabled(enabled);
      syncParticipants();
      return true;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Microphone permission failed.");
      return false;
    }
  };

  const setCameraEnabled = async (enabled: boolean) => {
    if (!roomRef.current) {
      return false;
    }

    try {
      await roomRef.current.localParticipant.setCameraEnabled(enabled);
      syncParticipants();
      return true;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Camera permission failed.");
      return false;
    }
  };

  const forceMuteMicrophone = async () => {
    if (!roomRef.current) {
      return;
    }

    await roomRef.current.localParticipant.setMicrophoneEnabled(false);
    syncParticipants();
  };

  return {
    participants,
    status,
    error,
    connect,
    disconnect,
    setMicrophoneEnabled,
    setCameraEnabled,
    forceMuteMicrophone
  };
}
