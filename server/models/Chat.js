import { Schema, model } from "mongoose";

const messageSchema = new Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new Schema({
  title: { type: String, required:true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  documentIds: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
  startedAt: { type: Date, default: Date.now },
  messages: [messageSchema]
});

const Chat = model('Chat', chatSchema);

export default Chat;