import User from "../models/User.js"; 
import { adminAuth } from "../services/firebase.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';

export const authenticate =  async (req, res) => {
  const { name, firebaseToken } = req.body;

  try {
    const decoded = await adminAuth.verifyIdToken(firebaseToken);

    let user = await User.findOne({ firebaseUID: decoded.uid });

    if (!user) {
      user = await User.create({
        firebaseUID: decoded.uid,
        name: decoded.name || name,
        email: decoded.email,
      });
    }

    const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.status(200).json({ token, user, message: "User authenticated!" });
  } catch (err) {
    res.status(401).json({ message: "Invalid Firebase token" });
  }
}

export const addRole = async (req, res) => {
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ message: "Role is required" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.status(200).json({ token, user, message: "Role updated successfully" });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ message: "Failed to update role" });
  }
}


export const guestAuth = (req, res) => {
  const { name: guestName, sessionCode } = req.body;

  if (!sessionCode) return res.status(400).json({ message: "Session code required" });

  try{
    const guestId = uuidv4();
    const token = jwt.sign({ guest: true, guestId, guestName , sessionCode, role: 'Student' }, process.env.JWT_SECRET,{ expiresIn: "1h" });
    
    res.status(200).json({ token, guestId, guestName, role: 'Student' });

  } catch(err){
    console.log(err);
    return res.status(500).json({message: "Error while authorizing guest user"})
  }
};