import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + "/leaderboard",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  const guestToken = JSON.parse(localStorage.getItem('guest'))?.token;

  if (token || guestToken) {
    config.headers.Authorization = `Bearer ${token? token : guestToken!=undefined && guestToken}`;
  }
  return config;
});

export const handleApi = async (promise) => {
  try {
    const res = await promise;
    return { data: res.data, status: res.status, error: null };
  } catch (error) {
    return {
      data: null,
      status: error.response?.status || 500,
      error: error.response?.data || error || "Unknown error",
    };
  }
};

export const submitQuizResult = async (quizData) => {
  return handleApi(API.post("/submit", quizData));
};

export const getLeaderboard = async (sessionCode) => {
  return handleApi(API.get(`/${sessionCode}`));
};

// Get detailed session analytics (educators only)
export const getSessionAnalytics = async (sessionCode) => {
  return handleApi(API.get(`/analytics/${sessionCode}`));
};



 