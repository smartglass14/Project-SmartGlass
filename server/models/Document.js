import { Schema, model } from "mongoose";

const documentSchema = new Schema({
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  fileType: {
    type: String,
    enum: ["pdf","txt"],
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  public_id:{
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

const Document = model("Document", documentSchema);

export default Document;
