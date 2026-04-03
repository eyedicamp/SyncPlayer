export const ROOM_EVENTS = {
  CREATE: "room:create",
  JOIN: "room:join",
  LEAVE: "room:leave",
  GET_STATE: "room:get_state",
  CREATED: "room:created",
  JOINED: "room:joined",
  LEFT: "room:left",
  STATE: "room:state",
  ERROR: "room:error"
} as const;

export const PARTICIPANT_EVENTS = {
  SET_READY: "participant:set_ready",
  SET_PLAYER_READY: "participant:set_player_ready",
  UPDATE_MEDIA_STATE: "participant:update_media_state",
  UPDATED: "participant:updated",
  LIST_UPDATED: "participant:list_updated"
} as const;

export const SESSION_EVENTS = {
  ALL_READY: "session:all_ready",
  NOT_READY: "session:not_ready"
} as const;

export const PLAYBACK_EVENTS = {
  SET_VIDEO: "playback:set_video",
  START_COUNTDOWN: "playback:start_countdown",
  PLAY: "playback:play",
  PAUSE: "playback:pause",
  SEEK: "playback:seek",
  HEARTBEAT: "playback:heartbeat",
  BUFFERING: "playback:buffering",
  RESYNC_ME: "playback:resync_me",
  VIDEO_SET: "playback:video_set",
  COUNTDOWN_STARTED: "playback:countdown_started",
  PLAY_NOW: "playback:play_now",
  PAUSED: "playback:paused",
  SEEKED: "playback:seeked",
  SYNC_CORRECTION: "playback:sync_correction",
  POLICY_APPLIED: "playback:policy_applied"
} as const;

export const CHAT_EVENTS = {
  SEND: "chat:send",
  MESSAGE: "chat:message"
} as const;

export const HOST_EVENTS = {
  MUTE_USER: "host:mute_user",
  MUTE_ALL: "host:mute_all",
  TRANSFER_HOST: "host:transfer_host",
  USER_MUTED: "host:user_muted",
  ALL_MUTED: "host:all_muted",
  CHANGED: "host:changed"
} as const;

export const SETTINGS_EVENTS = {
  UPDATE_BUFFERING_POLICY: "settings:update_buffering_policy",
  UPDATED: "settings:updated"
} as const;

export type RoomEventName = (typeof ROOM_EVENTS)[keyof typeof ROOM_EVENTS];
export type ParticipantEventName =
  (typeof PARTICIPANT_EVENTS)[keyof typeof PARTICIPANT_EVENTS];
export type SessionEventName =
  (typeof SESSION_EVENTS)[keyof typeof SESSION_EVENTS];
export type PlaybackEventName =
  (typeof PLAYBACK_EVENTS)[keyof typeof PLAYBACK_EVENTS];
export type ChatEventName = (typeof CHAT_EVENTS)[keyof typeof CHAT_EVENTS];
export type HostEventName = (typeof HOST_EVENTS)[keyof typeof HOST_EVENTS];
export type SettingsEventName =
  (typeof SETTINGS_EVENTS)[keyof typeof SETTINGS_EVENTS];
