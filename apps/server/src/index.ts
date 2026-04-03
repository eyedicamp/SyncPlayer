import { createServer } from "node:http";

import { createApp } from "./app";
import { env } from "./config/env";
import { createSocketServer } from "./socket";
import { RoomStore } from "./stores/roomStore";

const roomStore = new RoomStore();
const app = createApp(roomStore);
const httpServer = createServer(app);

createSocketServer(httpServer, roomStore);

httpServer.listen(env.port, () => {
  console.log(`SyncPlayer server listening on http://localhost:${env.port}`);
});
