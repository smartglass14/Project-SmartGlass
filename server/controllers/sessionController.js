import Session from "../models/Session.js";
import { customAlphabet } from "nanoid";

function generateAccessCode() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const nanoid = customAlphabet(alphabet, 6);
    return nanoid();
  }

export const createSession = async (req, res) => {
    try {
      const { name } = req.body;
      const educatorId = req.userId;
  
      const session = await Session.create({
        name,
        accessCode: generateAccessCode(),
        educator: educatorId,
      });
  
      res.status(201).json(session);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create session" });
    }
  }