import { config } from "dotenv";

config();

function parsePort(raw: string | undefined, fallback: number) {
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  port: parsePort(process.env.PORT, 4001),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  livekitApiKey: process.env.LIVEKIT_API_KEY ?? "",
  livekitApiSecret: process.env.LIVEKIT_API_SECRET ?? "",
  livekitUrl: process.env.LIVEKIT_URL ?? ""
};
