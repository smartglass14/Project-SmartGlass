import axios from "axios";
import Chat from '../models/Chat.js';

export const initiateNewChat = async (req, res) => {
  const userId = req.userId;
  const { title, documentIds } = req.body;

  if (!title || !documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
    return res.status(400).json({ message: "Title and at least one document are required." });
  }

  try {
    const newChat = await Chat.create({
      title,
      documentIds,
      userId,
      messages: [],
    });

    return res.status(201).json({ message: "new chat created!", chat: newChat });
  } catch (err) {
    console.error("initiateNewChat error:", err);
    return res.status(500).json({ message: "Failed to create chat." });
  }
};


export const chatWithAI = async (req, res) => {
  const { chatId, question } = req.body;

  if (!chatId || !question) {
    return res.status(400).json({ message: "question are required." });
  }

  try {
    const chat = await Chat.findById(chatId).populate('documentIds');
    if (!chat) {
      return res.status(404).json({ message: "Chat not found! create new chat" });
    }

    const userQuestions = chat.messages.filter(msg => msg.role === 'user').length;
    if (userQuestions >= 15) {
      return res.status(403).json({ message: "You have reached the maximum limit for this chat! Please start a new chat." })
    }

    if (!chat.documentIds || chat.documentIds.length === 0) {
      return res.status(400).json({ message: "No documents attached to this chat! please add your documents" });
    }

    const context = chat.documentIds.map(doc => doc.summary || '').join('\n');

    chat.messages.push({ role: 'user', content: question });
    await chat.save();


    let aiRes
    try {
      aiRes = await axios.post(`${process.env.AI_MODEL_URL}`, { context, question });
    } catch (err) {
      return res.status(502).json({ message: "Failed to connect to AI model." });
    }

    const answer = aiRes?.data?.answer;
    if (!answer) {
      return res.status(500).json({ message: "AI model did not return an answer." });
    }

    chat.messages.push({ role: 'assistant', content: answer });
    await chat.save();

    return res.status(200).json({ answer });

  } catch (err) {
    console.log('chatbot err: ', err);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

export const getAllChat = async (req, res) => {
    const userId = req.userId;
    try {
      const allChats = await Chat.find({ userId }).populate('documentIds').sort({ startedAt: -1 });
      if (!allChats || allChats.length === 0) {
        return res.status(404).json({ message: "No chats found for this user." });
      }
      return res.status(200).json({ chats: allChats });
    } catch (err) {
      console.log("error retrieving chats: ", err);
      return res.status(500).json({ message: "Internal server error" });
    }
};

export const getChatById = async (req, res) => {
    const { chatId } = req.params;
  
    if (!chatId) {
      return res.status(400).json({ message: "Something Went Wrong!" });
    }
  
    try {
      const chat = await Chat.findById(chatId).populate('documentIds');
      if (!chat) {
        return res.status(404).json({ message: "Chat not found." });
      }
      return res.status(200).json({ chat });
    } catch (err) {
      console.error("getChatById error:", err);
      return res.status(500).json({ message: "Internal server error." });
    }
  };

export const deleteChat = async (req, res) => {

    const { chatId } = req.params;
    const userId = req.userId;
  
    if (!chatId) {
      return res.status(400).json({ message: "chatId is required." });
    }
  
    try {
      const chat = await Chat.findOneAndDelete({ _id: chatId, userId });
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      return res.status(200).json({ message: "Chat deleted successfully." });
      
    } catch (err) {
      console.error("deleteChat error:", err);
      return res.status(500).json({ message: "Internal server error." });
    }
};