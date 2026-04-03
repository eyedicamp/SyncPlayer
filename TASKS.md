# SyncPlayer MVP Tasks

## Phase 1. Room Foundation
- [ ] Initialize monorepo or project structure
- [ ] Create shared package for common types and event names
- [ ] Implement backend room store in memory
- [ ] Implement `room:create`
- [ ] Implement `room:join`
- [ ] Implement `room:leave`
- [ ] Implement `room:get_state`
- [ ] Implement `room:state` broadcast
- [ ] Build home page for room creation
- [ ] Build room page route `/room/[roomId]`
- [ ] Build `RoomShell`
- [ ] Build participant list UI
- [ ] Build invite link copy button
- [ ] Confirm two browser tabs can join same room

## Phase 2. Base Layout
- [ ] Build `SplitPane`
- [ ] Add draggable resize handle
- [ ] Build right-side tab panel
- [ ] Add tabs for Call / Chat / Ready
- [ ] Set minimum size constraints for YouTube panel
- [ ] Confirm layout resizing works smoothly

## Phase 3. YouTube Integration
- [ ] Add YouTube URL input form
- [ ] Parse YouTube URL into `videoId`
- [ ] Integrate YouTube IFrame Player API
- [ ] Build `YouTubePlayerPanel`
- [ ] Detect player ready event
- [ ] Implement `playback:set_video`
- [ ] Broadcast `playback:video_set`
- [ ] Reflect selected video in all clients
- [ ] Show clear error UI for invalid URL or load failure

## Phase 4. Ready System
- [ ] Add participant `isReady` state
- [ ] Add participant `hasPlayerReady` state
- [ ] Implement `participant:set_ready`
- [ ] Implement `participant:set_player_ready`
- [ ] Build `ReadyPanel`
- [ ] Build ready list UI
- [ ] Compute all-ready condition server-side
- [ ] Emit `session:all_ready`
- [ ] Emit `session:not_ready`
- [ ] Disable host start button until everyone is ready

## Phase 5. Countdown Start
- [ ] Implement host-only start action
- [ ] Add server-side scheduled start time generation
- [ ] Implement `playback:start_countdown`
- [ ] Emit `playback:countdown_started`
- [ ] Build `CountdownOverlay`
- [ ] Start playback at scheduled time on all clients
- [ ] Emit `playback:play_now`
- [ ] Cancel countdown if readiness changes during countdown
- [ ] Confirm synchronized start across at least two clients

## Phase 6. Playback Control Sync
- [ ] Implement host-only `playback:pause`
- [ ] Implement host-only `playback:seek`
- [ ] Reflect pause state across all clients
- [ ] Reflect seek state across all clients
- [ ] Add periodic `playback:heartbeat` from clients
- [ ] Store latest playback time in server room state
- [ ] Implement drift detection thresholds
- [ ] Implement `playback:sync_correction`
- [ ] Prevent guest local control from overriding room state
- [ ] Add visible sync status badge for debugging

## Phase 7. Chat
- [ ] Define `ChatMessage` type
- [ ] Implement `chat:send`
- [ ] Implement `chat:message`
- [ ] Build `ChatPanel`
- [ ] Build `ChatMessageList`
- [ ] Build `ChatInput`
- [ ] Support system messages
- [ ] Show join/leave system messages
- [ ] Show ready/countdown system messages
- [ ] Confirm real-time chat across clients

## Phase 8. LiveKit Call
- [ ] Configure LiveKit project
- [ ] Add backend token generation endpoint or socket handler
- [ ] Add frontend LiveKit connection helper
- [ ] Implement `VideoCallPanel`
- [ ] Implement `ParticipantGrid`
- [ ] Implement `ParticipantTile`
- [ ] Connect local participant to room
- [ ] Display remote participant tiles
- [ ] Handle connection state UI
- [ ] Allow join as view-only if camera/mic permission denied

## Phase 9. Local Media Controls
- [ ] Build local mic toggle
- [ ] Build local camera toggle
- [ ] Sync local media state to UI
- [ ] Implement `participant:update_media_state`
- [ ] Reflect mic muted state in participant tile
- [ ] Reflect camera off state in participant tile
- [ ] Confirm toggles affect LiveKit tracks correctly

## Phase 10. Host Controls
- [ ] Implement `host:mute_user`
- [ ] Implement `host:mute_all`
- [ ] Build `HostControls`
- [ ] Restrict host actions server-side
- [ ] Show system message when host mutes someone
- [ ] Reflect mute action in participant UI
- [ ] Decide host leave behavior
- [ ] Implement `host:transfer_host` or room close behavior

## Phase 11. Buffering Policy
- [ ] Add room setting for buffering policy
- [ ] Implement `settings:update_buffering_policy`
- [ ] Emit `settings:updated`
- [ ] Detect YouTube buffering state change locally
- [ ] Implement `playback:buffering`
- [ ] Handle `pause_all` policy
- [ ] Handle `self_recover` policy
- [ ] Emit `playback:policy_applied`
- [ ] Show visible buffering/system status message

## Phase 12. Reconnect and Error Handling
- [ ] Handle socket reconnect
- [ ] Re-request room state after reconnect
- [ ] Handle YouTube player load failure
- [ ] Handle LiveKit reconnect state
- [ ] Handle invalid or expired room
- [ ] Handle duplicate join or stale participant cleanup
- [ ] Handle countdown cancellation cleanly
- [ ] Handle new participant joining during active session

## Phase 13. UI Polish
- [ ] Add toast notifications
- [ ] Improve ready/state badges
- [ ] Improve participant avatars/placeholders
- [ ] Improve countdown visuals
- [ ] Improve host control affordances
- [ ] Improve mobile fallback messaging even if not optimized
- [ ] Improve empty states and error states

## Phase 14. Final QA
- [ ] Test room creation and joining with two browsers
- [ ] Test Ready flow with two participants
- [ ] Test synchronized countdown start
- [ ] Test pause and seek sync
- [ ] Test chat delivery
- [ ] Test camera and microphone toggles
- [ ] Test host mute one participant
- [ ] Test host mute all
- [ ] Test buffering policy `pause_all`
- [ ] Test buffering policy `self_recover`
- [ ] Test reconnect behavior
- [ ] Test host leave behavior
- [ ] Test invalid YouTube URL behavior

## Nice-to-Have After MVP
- [ ] Persist room metadata in Redis or database
- [ ] Persist chat history
- [ ] Add spectator mode
- [ ] Add per-track notes or timestamp comments
- [ ] Add session analytics/logging dashboard
- [ ] Add Spotify / Apple Music integration later
- [ ] Add browser extension path for OTT later

