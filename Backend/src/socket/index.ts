  import { Server as httpServer } from "http";
  import { Server, Socket } from "socket.io";
  import { env } from "../config/env";
  import { UnauthorizedError } from "../error/AppError";
  import { verifyAccessToken } from "../utils/jwt";

  class SocketService {
    private static instance: SocketService;
    private io: Server | null = null;

    static getInstance = (): SocketService => {
      if (!SocketService.instance) {
        SocketService.instance = new SocketService();
      }
      return SocketService.instance;
    };

    init = (http: httpServer) => {
      this.io = new Server(http, {
        cors: {
          origin(origin, callback) {
            if (!origin) return callback(null, false);
            if (env.NODE_ENV === "production") {
              const allowOrigins = env.FRONTEND_URL ? [env.FRONTEND_URL] : [];

              return allowOrigins.includes(origin)
                ? callback(null, true)
                : callback(null, false);
            }

            callback(null, false);
          },
          credentials: true,
        },
      });

      this.io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token)
          throw new UnauthorizedError("Vui lòng đăng nhập vào hệ thống!");

        const decode = verifyAccessToken(token);
        socket.data.user = decode;
        next();
      });

      this.io.on("connection", (socket: Socket) => {
        const user = socket.data.user;

        console.log(`Người dùng ${user.username} đã kết nối!`);
        socket.join(`user_${user.userId}`);

        socket.on("join_conversation", (conversationId: string) => {
          socket.join(`conversation_${conversationId}`);
        });
      });
    };

    emitToUser = (userId: string, event: string, data: any) => {
      if (this.io) {
        this.io.to(`user_${userId}`).emit(event, data);
      }
    };

    emitToSendMessage = (conversationId: string, event: string, data: any) => {
      if (this.io) {
        this.io.to(`conversation_${conversationId}`).emit(event, data);
      }
    };
  }

  export const socketService = SocketService.getInstance();
