import { Schema, model } from "mongoose";

const sessionSchema = new Schema({
  sessionCode: {
    type: String,
    required: true,
    unique: true
  },
  educator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  sessionType: {
    type: String,
    enum: ['Quiz','Poll'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: ()=> Date.now() + ( 2 * 24 * 60 * 60 * 1000 )  //2 days
  }
});

export default model("Session", sessionSchema);
