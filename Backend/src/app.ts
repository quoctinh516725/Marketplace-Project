import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware";

import apiRoute from "./routes";

const PORT = env.PORT;

const app = express();

app.use(helmet());
app.use(  
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (env.NODE_ENV === "production") {
        const allowed = env.FRONTEND_URL ? [env.FRONTEND_URL] : [];
        return allowed.includes(origin)
          ? callback(null, true)
          : callback(null, false);
      }

      // Development
      callback(null, true);
    },
    credentials: true, // Cho phép gửi và nhận các thông tin xác thực như cookie, authentication
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/check", (req, res) => {
  res.json({
    success: true,
    message: `Server running on ${PORT}`,
  });
});

app.use("/api", apiRoute);
app.use("/", (_req: Request, res: Response) => {
  res.send("<b>WELCOME TO MY BACKEND WEBSITE!</b>");
});

app.use(errorHandler);

export default app;
