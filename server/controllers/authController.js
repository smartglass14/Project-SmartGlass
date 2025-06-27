import User from "../models/User.js"; 
import { adminAuth } from "../services/firebase.js";
import jwt from "jsonwebtoken";

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
        role: "student"
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.status(200).json({ token, user, message: "User authenticated!" });
  } catch (err) {
    res.status(401).json({ message: "Invalid Firebase token" });
  }
}