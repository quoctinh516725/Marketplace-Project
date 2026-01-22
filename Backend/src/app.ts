import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorMiddleware";

const PORT = env.PORT;

const app = express();

app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use("/check", (req, res) => {
  res.json({
    success: true,
    message: `Server running on ${PORT}`,
  });
});

app.use(errorHandler);

export default app;
