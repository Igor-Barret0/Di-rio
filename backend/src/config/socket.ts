import { Server as SocketServer } from "socket.io";
import { Server } from "http";
import { env } from "./env";

let io: SocketServer | null = null;

export function initSocketServer(server: Server): SocketServer {
  io = new SocketServer(server, {
    cors: { origin: env.corsOrigin, credentials: true },
  });
  return io;
}

export function getIO(): SocketServer {
  if (!io) throw new Error("Socket server not initialized");
  return io;
}
