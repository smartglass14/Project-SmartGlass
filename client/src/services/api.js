import axios from "axios";

export const API = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

export const ChatAPI = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + "/chat",
});

ChatAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const handleApi = async (promise) => {
  try {
    const res = await promise;
    return { data: res.data, status:res.status, error: null };
  } catch (error) {
    return {
      data: null,
      status: error.response?.status || 500,
      error: error.response?.data || error || "Unknown error",
    };
  }
};

