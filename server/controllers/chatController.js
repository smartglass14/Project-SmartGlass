import axios from "axios";
import Chat from '../models/Chat.js';
import Document from '../models/Document.js';

export const initiateNewChat = async (req, res) => {
  const userId = req.userId;
  const { title, documentIds } = req.body;

  if (!title || !documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
    return res.status(400).json({ message: "At least one document are required." });
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
  const { chatId, content } = req.body;
  const user_id = req.userId;

  if (!chatId || !content) {
    return res.status(400).json({ message: "content is required." });
  }

  try {

    let chat = await Chat.findById(chatId);
    if(!chat){
      return res.status(404).json("Chat not Found");
    }
    
    let aiRes = await axios.post(`${process.env.AI_MODEL_URL}/ask`, { question:content, user_id });

    const answer = aiRes?.data?.answer;
    if (!answer) {
      return res.status(500).json({ message: "AI did not return an answer." });
    }

    chat.messages.push({role: 'user', content});
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
        return res.status(404)
      }
      return res.status(200).json({ chats: allChats });
    } catch (err) {
      console.log("error retrieving chats: ", err);
      return res.status(500).json({ message: "Internal server error" });
    }
};

export const getChatById = async (req, res) => {
    const { id: chatId } = req.params;
  
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

    const { id:chatId } = req.params;
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

export const renameChat = async (req, res) => {

    const { chatId, newTitle } = req.body;
    const userId = req.userId;
    
    if (!chatId) {
      return res.status(400).json({ message: "chatId is required." });
    }
  
    try {
      const chat = await Chat.findOneAndUpdate({ _id: chatId, userId }, {title: newTitle});
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      return res.status(200).json({ message: "Title Updated"});
      
    } catch (err) {
      console.error("renamingChat error:", err);
      return res.status(500).json({ message: "Error while updating title" });
    }
};