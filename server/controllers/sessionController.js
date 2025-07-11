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

  export const getSessionByCode = async(req, res)=> {
    try{ 
      const {code} = req.params;
      if(!code){
        return res.status(400).json({message: "code must be needed"});
      }

      let session = await Session.findOne({sessionCode:code});
      if(!session){
        return res.status(400).json({message: "Invalid Session Code"})
      }
      if(session.expiresAt <= Date.now){
        return res.status(400).json({message: "Session was expired"})
      }

      res.status(200).json({ sessionType: session.sessionType })
      
    }catch(err){
      console.log(err);
      res.status(500).json({message: "Something went wrong while fetching session"});
    }
  }