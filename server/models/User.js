import { Schema, model } from "mongoose";

const userSchema = new Schema({
  firebaseUID: {
    type: String,
    required: true,
    unique: true
  },
  name:{
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["Student", "Educator"],
  },

}, { timestamps: true });

export default model("User", userSchema);
