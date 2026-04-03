# SyncPlayer

SyncPlayer is a monorepo MVP for synchronized YouTube watch sessions with:

- room creation and join flow
- host and guest room model
- synchronized YouTube playback
- participant ready flow
- host-triggered countdown start
- integrated LiveKit call panel
- mic and camera toggles
- host mute controls
- real-time room chat
- configurable buffering policy
- resizable room layout

## Structure

```txt
apps/
  server/   Express + Socket.IO + LiveKit token API
  web/      Next.js App Router frontend
packages/
  shared/   Shared room, playback, media, chat, and event contracts
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the sample env file and fill in the LiveKit values if you want the call tab to connect:

```bash
cp .env.example .env
```

3. Run both apps together:

```bash
npm run dev
```

4. Open the frontend:

```txt
http://localhost:3000
```

The Socket.IO and API server runs on:

```txt
http://localhost:4001
```

## Environment Variables

Required for the base app:

- `NEXT_PUBLIC_SOCKET_URL`
- `NEXT_PUBLIC_API_URL`
- `CLIENT_ORIGIN`
- `PORT`

Required for LiveKit call support:

- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `LIVEKIT_URL`

## Verification

These checks pass in the current repo:

- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Current MVP Status

Implemented in this pass:

- shared package for room, playback, media, chat, and settings event contracts
- Express + Socket.IO server with in-memory room state
- room create, join, leave, get-state, and live room-state broadcasting
- host transfer on host disconnect
- ready flow and player-ready flow
- synchronized countdown scheduling and play-now event
- host playback play, pause, seek, heartbeat, and drift correction events
- chat with system messages
- buffering policy updates and pause-all vs self-recover handling
- Next.js home page with create and join flows
- `/room/[roomId]` room route with split-pane layout
- YouTube embed loading, host URL submission, countdown overlay, and host playback controls
- LiveKit token API and call tab scaffolding with participant tiles, local mic/cam toggles, and host mute actions

Still worth another pass:

- browser-level end-to-end QA with multiple tabs and a real LiveKit room
- autoplay recovery UX for browsers that block scheduled playback
- richer reconnect behavior and stale participant cleanup
- stronger remote mute enforcement through LiveKit server-side moderation APIs
- more polished host leave flow and mid-session join/spectator behavior
- deeper YouTube sync heuristics and smoother correction strategy
