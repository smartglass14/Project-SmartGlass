import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
});

const handleApi = async (promise) => {
  try {
    const res = await promise;
    return { data: res.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data?.message || error.message || "Unknown error",
    };
  }
};

export const login = async (email, password) =>
  handleApi(API.post("/auth/login", { email, password }));

export const registerUser = async (name, email, password) =>
  handleApi(API.post("/auth/register", { name, email, password }));

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