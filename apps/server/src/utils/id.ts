const ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createRoomId(length = 6) {
  let roomId = "";
  for (let index = 0; index < length; index += 1) {
    roomId += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)];
  }

  return roomId;
}

export function createMessageId() {
  return `msg_${crypto.randomUUID()}`;
}
