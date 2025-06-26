import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import socketSetup from "./socket/socket.js";
import authRoutes from "./Routes/auth.routes.js";
import sessionRoutes from "./routes/session.routes.js";

dotenv.config();

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Server is running! :)"));

app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);

socketSetup(server);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    const PORT = process.env.PORT || 10000;
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("MongoDB Error:", err);
  });