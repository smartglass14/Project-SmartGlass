import { Schema, model } from "mongoose";

const sessionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  accessCode: {
    type: String,
    required: true,
    unique: true
  },
  educator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default model("Session", sessionSchema);
