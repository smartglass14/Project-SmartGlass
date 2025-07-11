import Session from "../models/Session.js";
import { customAlphabet } from "nanoid";

function generateAccessCode() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const nanoid = customAlphabet(alphabet, 6);
    return nanoid();
  }

export const createSession = async (req, res) => {

    try {
      const { sessionType } = req.body;
      const educatorId = req.userId;
      const sessionCode = generateAccessCode();
  
      const session = await Session.create({
        sessionType,
        sessionCode,
        educator: educatorId,
      });
  
      res.status(201).json({sessionId: session._id, sessionCode});
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create session" });
    }
  }