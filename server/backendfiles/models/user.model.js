import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUID: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: String,
  role: { type: String, enum: ['student', 'educator', 'admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
