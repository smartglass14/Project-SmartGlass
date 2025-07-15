import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import socketSetup from "./socket/socket.js";
import authRoutes from "./routes/auth.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import quizRoutes from "./routes/quiz.routes.js"
import pollRoutes from "./routes/poll.routes.js"

dotenv.config();

const app = express();
const server = createServer(app);

app.use(cors({
  origin: [`${process.env.CLIENT_URL}`,"http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("Server is running! :)"));

app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes)
app.use("/api/quiz", quizRoutes)
app.use("/api/poll", pollRoutes)

socketSetup(server);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    const PORT = process.env.PORT || 10000;
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log("Websocket intialized");
    });
  })
  .catch(err => {
    console.error("MongoDB Error:", err);
  });
