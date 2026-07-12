import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 502) {
      error.message = "The signup service is temporarily unavailable. Please try again in a moment.";
    }
    return Promise.reject(error);
  }
);

export default API;