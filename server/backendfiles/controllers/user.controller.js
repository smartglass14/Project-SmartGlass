import firebaseAdmin from '../utils/firebase.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const auth = firebaseAdmin.auth();

export async function registerUser(req, res) {
  const { firebaseToken, name, role } = req.body;
  try {
    const decodedToken = await auth.verifyIdToken(firebaseToken);
    let user = await User.findOne({ firebaseUID: decodedToken.uid });

    if (!user) {
      user = await User.create({
        firebaseUID: decodedToken.uid,
        email: decodedToken.email,
        name,
        role
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    res.status(401).json({ message: 'Firebase token invalid', error: err.message });
  }
}

export async function loginUser(req, res) {
  const { firebaseToken } = req.body;
  try {
    const decodedToken = await auth.verifyIdToken(firebaseToken);
    const user = await User.findOne({ firebaseUID: decodedToken.uid });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user });
    res.status(200).json({ message: 'Login successful', token, user });
    console.log(`User ${user.name} logged in successfully`);
  } catch (err) {
    res.status(401).json({ message: 'Login failed', error: err.message });
  }
}
