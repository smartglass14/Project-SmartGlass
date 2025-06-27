import axios from "axios";

export const API = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

export const handleApi = async (promise) => {
  try {
    const res = await promise;
    return { data: res.data, status:res.status, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data?.message || error.message || "Unknown error",
    };
  }
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return handleApi(
    API.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
};

export const sendMessageToBot = async (message) =>
  handleApi(API.post("/chatbot", { message }));