import http from "http";
import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import redis from "./config/redis";
import { socketService } from "./socket";

const PORT = env.PORT;
const server = http.createServer(app);

socketService.init(server);

async function shutDown(): Promise<void> {
  console.log("Server has been shutdown...");
  await prisma.$disconnect();
  console.log("Prisma disconnect...");
  await redis.disconnect();
  console.log("Redis disconnect...");

  process.exit(0);
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("Unhandled Rejection:", err);
  server.close(() => {
    shutDown();
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("Uncaught Exception:", err);
  shutDown();
});

// Handle termination signals
process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
