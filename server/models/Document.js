import { Schema, model } from "mongoose";

const documentSchema = new Schema({
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  originalName: String,
  fileUrl: {
    type: String,
    required: true
  },
  summary: {
    type: String
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

export default model("Document", documentSchema);
