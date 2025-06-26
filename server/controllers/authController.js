import User from "../models/User.js"; 
import { adminAuth } from "../services/firebase.js";
import jwt from "jsonwebtoken";

export const authenticate =  async (req, res) => {
  const { firebaseToken } = req.body;

  try {
    const decoded = await adminAuth.verifyIdToken(firebaseToken);

    let user = await User.findOne({ firebaseUID: decoded.uid });

    if (!user) {
      user = await User.create({
        firebaseUID: decoded.uid,
        name: decoded.name || "Anonymous",
        email: decoded.email,
        role: "student"
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid Firebase token" });
  }
}