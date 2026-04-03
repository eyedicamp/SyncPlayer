# SyncPlayer MVP Plan

## 1. Project Overview

SyncPlayer is a web app MVP for synchronized YouTube watch sessions with integrated video call and chat.

The initial goal is to support:
- room creation and joining
- synchronized YouTube playback
- participant ready flow
- host-triggered countdown start
- integrated video call
- mic/cam controls
- host mute controls
- real-time chat
- configurable buffering policy
- resizable layout between YouTube and call/chat panel

This MVP targets a small-group remote listening/watching experience where users want to feel like they are consuming content together in real time.

---

## 2. Core Product Requirements

### Included in MVP
- YouTube video embedded in the main panel
- video call visible on the same screen
- adjustable panel sizes
- host/guest room model
- participants press Ready before session start
- host can start playback only after everyone is ready
- synchronized countdown before simultaneous playback
- host controls playback flow
- participants can mute/unmute mic and toggle camera
- host can mute individual participants or all participants
- real-time chat
- buffering policy configurable per room:
  - pause everyone if one participant buffers
  - or resync only the affected participant

### Explicitly excluded from MVP
- local file sync playback
- uploaded audio playback
- Spotify / Apple Music integration
- Netflix / OTT browser extension support
- recording
- moderation system beyond host controls
- persistent database-backed chat history
- mobile-first optimization in first iteration

---

## 3. Recommended Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Zustand for client state
- Socket.IO client
- YouTube IFrame Player API
- LiveKit client SDK

### Backend
- Node.js
- TypeScript
- Express or Fastify
- Socket.IO server
- LiveKit server token generation

### Shared
- shared TypeScript package for room state, event payloads, enums, and helper types

### Deployment
- frontend: Vercel or equivalent
- backend: Railway / Fly.io / Render / VPS
- LiveKit Cloud or self-hosted LiveKit

---

## 4. High-Level Architecture

The system is split into two planes.

### A. Content Sync Plane
Responsible for:
- room state
- ready status
- countdown scheduling
- playback control
- sync correction
- buffering policy
- chat events

This is handled by the application server via Socket.IO.

### B. Communication Plane
Responsible for:
- webcam video
- microphone audio
- participant media presence
- host mute actions

This is handled by LiveKit.

### Principle
The app must **not** relay YouTube media through the server. Each client loads and plays the YouTube video locally. The server synchronizes playback state only.

---

## 5. Monorepo Structure

Recommended repository structure:

```txt
watch-party/
├─ apps/
│  ├─ web/
│  └─ server/
├─ packages/
│  ├─ shared/
│  └─ config/
├─ package.json
├─ pnpm-workspace.yaml
└─ README.md
```

If monorepo feels too heavy at first, a simpler structure is acceptable:

```txt
watch-party/
├─ web/
├─ server/
└─ shared/
```

---

## 6. Frontend Folder Structure

```txt
apps/web/
├─ src/
│  ├─ app/
│  │  ├─ page.tsx
│  │  ├─ room/[roomId]/page.tsx
│  │  └─ layout.tsx
│  │
│  ├─ components/
│  │  ├─ room/
│  │  │  ├─ RoomShell.tsx
│  │  │  ├─ RoomHeader.tsx
│  │  │  ├─ RoomStatusBar.tsx
│  │  │  └─ InviteButton.tsx
│  │  │
│  │  ├─ youtube/
│  │  │  ├─ YouTubePlayerPanel.tsx
│  │  │  ├─ YouTubeUrlForm.tsx
│  │  │  ├─ CountdownOverlay.tsx
│  │  │  └─ SyncStatusBadge.tsx
│  │  │
│  │  ├─ video/
│  │  │  ├─ VideoCallPanel.tsx
│  │  │  ├─ ParticipantGrid.tsx
│  │  │  ├─ ParticipantTile.tsx
│  │  │  ├─ LocalControls.tsx
│  │  │  └─ HostControls.tsx
│  │  │
│  │  ├─ chat/
│  │  │  ├─ ChatPanel.tsx
│  │  │  ├─ ChatMessageList.tsx
│  │  │  ├─ ChatInput.tsx
│  │  │  └─ SystemMessage.tsx
│  │  │
│  │  ├─ lobby/
│  │  │  ├─ ReadyPanel.tsx
│  │  │  ├─ ParticipantReadyList.tsx
│  │  │  └─ BufferingPolicySelector.tsx
│  │  │
│  │  ├─ layout/
│  │  │  ├─ SplitPane.tsx
│  │  │  ├─ ResizableHandle.tsx
│  │  │  └─ TabPanel.tsx
│  │  │
│  │  └─ common/
│  │     ├─ Button.tsx
│  │     ├─ Modal.tsx
│  │     ├─ Badge.tsx
│  │     ├─ Avatar.tsx
│  │     └─ Toast.tsx
│  │
│  ├─ hooks/
│  │  ├─ useRoomSocket.ts
│  │  ├─ useRoomStore.ts
│  │  ├─ useYouTubePlayer.ts
│  │  ├─ useCountdown.ts
│  │  ├─ useLiveKitRoom.ts
│  │  ├─ useLocalMediaControls.ts
│  │  └─ useResizablePane.ts
│  │
│  ├─ lib/
│  │  ├─ socket.ts
│  │  ├─ livekit.ts
│  │  ├─ youtube.ts
│  │  ├─ time.ts
│  │  ├─ room.ts
│  │  └─ validation.ts
│  │
│  ├─ store/
│  │  ├─ roomStore.ts
│  │  ├─ chatStore.ts
│  │  ├─ mediaStore.ts
│  │  └─ uiStore.ts
│  │
│  ├─ types/
│  │  └─ index.ts
│  │
│  └─ styles/
│     └─ globals.css
├─ public/
└─ package.json
```

---

## 7. Backend Folder Structure

```txt
apps/server/
├─ src/
│  ├─ index.ts
│  ├─ app.ts
│  │
│  ├─ socket/
│  │  ├─ index.ts
│  │  ├─ roomHandlers.ts
│  │  ├─ chatHandlers.ts
│  │  ├─ playbackHandlers.ts
│  │  └─ mediaHandlers.ts
│  │
│  ├─ services/
│  │  ├─ roomService.ts
│  │  ├─ sessionService.ts
│  │  ├─ syncService.ts
│  │  ├─ chatService.ts
│  │  └─ livekitTokenService.ts
│  │
│  ├─ stores/
│  │  ├─ roomStore.ts
│  │  └─ sessionStore.ts
│  │
│  ├─ domain/
│  │  ├─ room.ts
│  │  ├─ participant.ts
│  │  ├─ playback.ts
│  │  └─ chat.ts
│  │
│  ├─ utils/
│  │  ├─ id.ts
│  │  ├─ logger.ts
│  │  ├─ clock.ts
│  │  └─ guards.ts
│  │
│  └─ config/
│     └─ env.ts
├─ package.json
└─ tsconfig.json
```

---

## 8. Shared Package Structure

```txt
packages/shared/
├─ src/
│  ├─ events.ts
│  ├─ room.ts
│  ├─ chat.ts
│  ├─ playback.ts
│  ├─ media.ts
│  ├─ api.ts
│  └─ index.ts
└─ package.json
```

---

## 9. Main UI Structure

The room page should be composed like this:

```tsx
<RoomShell>
  <RoomHeader />
  <RoomStatusBar />

  <SplitPane
    left={<YouTubePlayerPanel />}
    right={
      <TabPanel
        tabs={[
          { key: "call", label: "Call", content: <VideoCallPanel /> },
          { key: "chat", label: "Chat", content: <ChatPanel /> },
          { key: "lobby", label: "Ready", content: <ReadyPanel /> },
        ]}
      />
    }
  />
</RoomShell>
```

### Layout Principles
- left side is the main YouTube content
- right side contains call/chat/ready tabs
- the split should be resizable by drag
- the YouTube player must remain above minimum embed size
- chat and call should remain visible without interrupting playback

---

## 10. State Management

### roomStore
Stores room state and participant presence.

```ts
type RoomStore = {
  room: RoomState | null
  me: Participant | null
  setRoom: (room: RoomState) => void
  updateParticipant: (p: Participant) => void
  setPhase: (phase: RoomPhase) => void
}
```

### chatStore
Stores in-memory room chat.

```ts
type ChatStore = {
  messages: ChatMessage[]
  addMessage: (msg: ChatMessage) => void
  clear: () => void
}
```

### mediaStore
Stores local media state and playback-related client info.

```ts
type MediaStore = {
  isMicMuted: boolean
  isCamOff: boolean
  isPlayerReady: boolean
  isBuffering: boolean
  syncOffsetMs: number
  setMicMuted: (v: boolean) => void
  setCamOff: (v: boolean) => void
  setPlayerReady: (v: boolean) => void
  setBuffering: (v: boolean) => void
  setSyncOffsetMs: (v: number) => void
}
```

### uiStore
Stores tab selection, modal state, and minor UI settings.

```ts
type UiStore = {
  activeRightTab: "call" | "chat" | "lobby"
  isSettingsOpen: boolean
  setActiveRightTab: (tab: "call" | "chat" | "lobby") => void
  setSettingsOpen: (v: boolean) => void
}
```

---

## 11. Core Domain Types

```ts
export type RoomPhase = "lobby" | "countdown" | "playing" | "paused"

export type BufferingPolicy = "pause_all" | "self_recover"

export type ParticipantRole = "host" | "guest"

export interface Participant {
  userId: string
  name: string
  role: ParticipantRole
  isReady: boolean
  isMicMuted: boolean
  isCamOff: boolean
  isBuffering: boolean
  hasPlayerReady: boolean
  joinedAt: number
}

export interface PlaybackState {
  videoId: string | null
  status: "idle" | "playing" | "paused" | "buffering"
  currentTimeSec: number
  startedAtMs: number | null
  countdownTargetMs: number | null
  lastUpdatedBy: string | null
}

export interface RoomState {
  roomId: string
  hostId: string
  phase: RoomPhase
  bufferingPolicy: BufferingPolicy
  participants: Participant[]
  playback: PlaybackState
}
```

### Chat Message Type

```ts
export interface ChatMessage {
  messageId: string
  roomId: string
  userId: string
  userName: string
  kind: "text" | "system"
  text: string
  createdAt: number
}
```

---

## 12. Event Naming Convention

Use namespaced event naming throughout the app:

- `room:*`
- `participant:*`
- `playback:*`
- `chat:*`
- `host:*`
- `settings:*`

This must remain consistent across server and client.

---

## 13. Socket Event Definitions

### A. Room Events

#### Client to Server
- `room:create`
- `room:join`
- `room:leave`
- `room:get_state`

#### Example payloads

```ts
type RoomCreatePayload = {
  userName: string
}

type RoomJoinPayload = {
  roomId: string
  userName: string
}
```

#### Server to Client
- `room:created`
- `room:joined`
- `room:left`
- `room:state`
- `room:error`

---

### B. Participant / Ready Events

#### Client to Server
- `participant:set_ready`
- `participant:set_player_ready`
- `participant:update_media_state`

#### Example payloads

```ts
type SetReadyPayload = {
  roomId: string
  isReady: boolean
}

type SetPlayerReadyPayload = {
  roomId: string
  hasPlayerReady: boolean
}

type UpdateMediaStatePayload = {
  roomId: string
  isMicMuted: boolean
  isCamOff: boolean
}
```

#### Server to Client
- `participant:updated`
- `participant:list_updated`
- `session:all_ready`
- `session:not_ready`

---

### C. Playback Events

#### Client to Server
- `playback:set_video`
- `playback:start_countdown`
- `playback:play`
- `playback:pause`
- `playback:seek`
- `playback:heartbeat`
- `playback:buffering`
- `playback:resync_me`

#### Example payloads

```ts
type SetVideoPayload = {
  roomId: string
  videoId: string
}

type StartCountdownPayload = {
  roomId: string
  targetStartAtMs: number
}

type PlaybackHeartbeatPayload = {
  roomId: string
  currentTimeSec: number
  playerState: "playing" | "paused" | "buffering"
  sentAtMs: number
}

type BufferingPayload = {
  roomId: string
  isBuffering: boolean
}
```

#### Server to Client
- `playback:video_set`
- `playback:countdown_started`
- `playback:play_now`
- `playback:paused`
- `playback:seeked`
- `playback:sync_correction`
- `playback:policy_applied`

---

### D. Chat Events

#### Client to Server
- `chat:send`

#### Example payload

```ts
type ChatSendPayload = {
  roomId: string
  text: string
}
```

#### Server to Client
- `chat:message`

---

### E. Host Events

#### Client to Server
- `host:mute_user`
- `host:mute_all`
- `host:transfer_host`

#### Example payloads

```ts
type HostMuteUserPayload = {
  roomId: string
  targetUserId: string
}

type HostMuteAllPayload = {
  roomId: string
}
```

#### Server to Client
- `host:user_muted`
- `host:all_muted`
- `host:changed`

---

### F. Settings Events

#### Client to Server
- `settings:update_buffering_policy`

#### Example payload

```ts
type UpdateBufferingPolicyPayload = {
  roomId: string
  policy: "pause_all" | "self_recover"
}
```

#### Server to Client
- `settings:updated`

---

## 14. Playback Synchronization Model

### Startup Flow
1. host creates room
2. host sets YouTube URL
3. participants join room
4. each participant loads the player locally
5. each participant presses Ready
6. server verifies all participants are ready
7. host triggers Start
8. server broadcasts a future start time such as current server time + 3000 ms
9. clients show a countdown overlay
10. all clients call `playVideo()` at the scheduled time

### Sync Principle
- the server is the source of truth for scheduled start time and phase
- each client tracks current playback time locally
- clients send periodic heartbeat events while playing
- if a client drifts beyond threshold, the server instructs a correction

### Suggested Drift Thresholds
- <= 100 ms: ignore
- 100 to 300 ms: mild correction or quick seek
- > 300 ms: force seek

### Buffering Policy Modes
#### `pause_all`
If any participant buffers, server pauses playback for everyone.

#### `self_recover`
If any participant buffers, only that participant is resynced.

Default recommendation for MVP: `self_recover`

---

## 15. LiveKit Integration Principles

### Required features
- user can join video call inside room page
- user can toggle microphone on/off
- user can toggle camera on/off
- host can mute individual participant
- host can mute all participants

### Important behavioral rule
Host mute should be supported, but remote forced unmute should not be assumed. A muted participant should be allowed to unmute themselves unless a stricter policy is intentionally implemented later.

### Suggested implementation approach
- generate LiveKit access token from backend
- connect frontend room by roomId
- publish local camera and microphone tracks
- display remote participant tiles in right-side call tab

---

## 16. Chat System

Chat is real-time and room-scoped.

### Supported message types
- normal text messages
- system messages
  - user joined
  - user left
  - user is ready
  - countdown started
  - playback paused due to buffering policy
  - host muted participant

Persistent storage is not required in MVP.

---

## 17. Edge Cases and Error Handling

The following cases must be handled.

### Session flow edge cases
- if someone unreadies during countdown, cancel countdown
- if a new participant joins during countdown, treat as not-ready or spectator
- if host leaves, either end room or transfer host
- if video URL changes during playing state, return room to lobby
- if a participant cannot autoplay, show a clear recovery UI
- if camera/mic permission is denied, allow view-only participation

### Network / media edge cases
- disconnected socket should trigger reconnect flow
- temporary LiveKit disconnect should show connection state
- YouTube player load failure should display retry option
- duplicate heartbeat spam should be rate-limited or ignored

---

## 18. Security and Permissions Notes

- camera and microphone access require secure context
- deployment should assume HTTPS from the beginning
- room join should validate room existence
- host-only actions must be server-authorized, not just hidden in UI
- playback control authority should be enforced server-side

---

## 19. Implementation Order

### Phase 1. Room foundation
Goal:
- create room
- join room
- share room link
- show participant list
- render base split layout

Deliverables:
- `room:create`
- `room:join`
- `room:state`
- `RoomShell`
- `SplitPane`

Done when:
- two browser tabs can join same room
- participant list updates in real time

### Phase 2. YouTube integration
Goal:
- host enters YouTube URL
- all participants load the same video
- detect player ready state

Deliverables:
- `YouTubeUrlForm`
- `useYouTubePlayer`
- `playback:set_video`
- `playback:video_set`

Done when:
- host sets URL and guests see the same embedded video
- player ready state can be tracked reliably

### Phase 3. Ready system
Goal:
- participants can mark themselves ready
- player-ready and user-ready are separate concepts
- host can start only when all are ready

Deliverables:
- `participant:set_ready`
- `participant:set_player_ready`
- `session:all_ready`
- `ReadyPanel`

Done when:
- ready state is reflected live
- start button activates only when everyone is ready

### Phase 4. Countdown start
Goal:
- synchronized 3-second countdown before playback
- all clients start at same scheduled time

Deliverables:
- `playback:start_countdown`
- `playback:countdown_started`
- `CountdownOverlay`
- `playback:play_now`

Done when:
- multiple clients display same countdown and begin together

### Phase 5. Pause / seek / heartbeat sync
Goal:
- host pause and seek affect everyone
- drift can be detected and corrected

Deliverables:
- `playback:pause`
- `playback:seek`
- `playback:heartbeat`
- `playback:sync_correction`

Done when:
- pause and seek are reflected in all clients
- heavily desynced clients get corrected

### Phase 6. LiveKit call
Goal:
- participants can see and hear each other
- local mic and cam toggles work

Deliverables:
- LiveKit token generation
- `VideoCallPanel`
- `ParticipantGrid`
- `LocalControls`

Done when:
- two participants can connect and exchange media
- mic and camera toggles update UI and stream behavior

### Phase 7. Host mute controls
Goal:
- host can mute one participant or everyone

Deliverables:
- `host:mute_user`
- `host:mute_all`
- `HostControls`

Done when:
- host mute is reflected in UI and media state

### Phase 8. Chat
Goal:
- text chat inside room
- system messages included

Deliverables:
- `chat:send`
- `chat:message`
- `ChatPanel`

Done when:
- participants can exchange room messages in real time

### Phase 9. Buffering policy
Goal:
- support `pause_all` and `self_recover`

Deliverables:
- `settings:update_buffering_policy`
- `playback:buffering`
- `playback:policy_applied`

Done when:
- buffering mode can be changed in settings
- buffering events follow selected policy

### Phase 10. Polish
Goal:
- fill UX and operational gaps

Deliverables:
- toast notifications
- invite copy
- reconnect handling
- host leave flow
- spectator or mid-session join logic
- better error messages

Done when:
- the app is testable by real users without manual developer intervention

---

## 20. Suggested Git Commit Sequence

1. `init monorepo and shared types`
2. `implement room create and join`
3. `add split layout and room shell`
4. `integrate youtube iframe player`
5. `implement ready state and lobby panel`
6. `implement countdown synchronized playback`
7. `add playback pause seek and heartbeat sync`
8. `integrate livekit video call`
9. `add local mic cam controls`
10. `add host mute controls`
11. `implement chat`
12. `add buffering policy handling`
13. `polish room ux and edge cases`

---

## 21. MVP Acceptance Criteria

The MVP is considered complete when all of the following are true:

- a host can create a room and share an invite link
- guests can join the room and appear in participant list
- host can set a YouTube video
- all clients load the same video locally
- every participant can press Ready
- host can only start when everyone is ready
- a shared countdown is displayed before start
- playback starts nearly simultaneously across clients
- host pause and seek propagate correctly
- video call works in the same room page
- participants can toggle mic and camera
- host can mute one participant or all participants
- room chat works in real time
- buffering policy can be changed and applied
- layout can be resized between content and side panel

---

## 22. Notes for Codex

### Priority
Build the product incrementally. Do not start with LiveKit or advanced sync correction before room creation, YouTube load, and Ready flow work.

### Design preference
- keep components modular
- keep server-side authority for room and playback actions
- keep shared types centralized
- keep UI functional before polishing visuals

### Important implementation rules
- guest direct playback control should be blocked or ignored in MVP
- `playerReady` and `isReady` must be separate state values
- countdown scheduling must use server time, not only client local time
- buffering handling should be explicit and observable in logs

