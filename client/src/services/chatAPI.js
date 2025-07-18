import toast from "react-hot-toast";
import { ChatAPI, handleApi } from "./api";

export const initiateNewChat = async ({ title, documentIds }) => {
  const res = await handleApi(ChatAPI.post("/new", { title, documentIds }));
  if(res.error){
    toast.error(res.error.message);
  }
  if(res.status === 201){
    toast.success(res.data.message);
    return res.data.chat;
  }
};

export const chatWithAI = async ({ chatId, content }) => {
  const res = await handleApi(ChatAPI.post("/", { chatId, content }));
  if(res.error){
    toast.error(res.error.message);
  }
  if(res.status === 200){
    return res.data.answer;
  }
};

export const getAllChats = async () => {
  const res = await handleApi(ChatAPI.get("/all"));
  if(res.error){
    toast.error(res.error.message);
  }
  if(res.status === 200){
    return res.data.chats;
  }
  return [];
};

export const getChatById = async (chatId) => {
  const res = await handleApi(ChatAPI.get(`/${chatId}`));
  if(res.error){
    toast.error(res.error.message);
  }
  if(res.status === 200){
    return res.data.chat;
  }
};

export const deleteChat = async (chatId) => {
  const res = await handleApi(ChatAPI.delete(`/${chatId}`));
  if(res.error){
    toast.error(res.error.message);
  }
  if(res.status === 200){
    toast.success(res.data.message);
    return true;
  }
  return false;
};

export const renameChat = async(chatId, newTitle)=> {
    const res = await handleApi(ChatAPI.put("/", {chatId, newTitle}));
    if(res.error){
        toast.error(res.error.message);
    }
    if(res.status === 200){
        return toast.success(res.data.message);
    }
}