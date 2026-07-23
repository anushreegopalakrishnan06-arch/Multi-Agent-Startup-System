import axios from "axios";

// Backend URL — uses Vite proxy in development
const API_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_URL,
});

// --- JWT Interceptor ---
// Automatically attaches the JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth API ---

export const authSignup = async (email, password, name) => {
  const res = await api.post("/api/auth/signup", { email, password, name });
  return res.data; // { status, token, user }
};

export const authLogin = async (email, password) => {
  const res = await api.post("/api/auth/login", { email, password });
  return res.data;
};

export const authGoogle = async (googleAccessToken) => {
  const res = await api.post("/api/auth/google", { token: googleAccessToken });
  return res.data;
};

export const authMe = async () => {
  const res = await api.get("/api/auth/me");
  return res.data;
};

export const updateProfile = async (formData) => {
  const res = await api.put("/api/auth/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// --- Agent Execution API ---

export const runTrendAgent = async () => {
  const res = await api.post("/api/trend", {});
  return res.data; // { status, data: "markdown text" }
};

export const runBusinessDiscovery = async (inputs) => {
  const res = await api.post("/api/discovery", {
    field: inputs.industry || "Technology",
    budget: inputs.budget || "100000",
  });
  return res.data;
};

export const runFinancialAgent = async (discoveryData) => {
  const res = await api.post("/api/financial", {
    business_report: discoveryData.data,
  });
  return res.data;
};

export const runValidationAgent = async (financialData) => {
  const res = await api.post("/api/validation", {
    financial_report: financialData.data,
  });
  return res.data;
};

// --- Report CRUD API ---

export const saveReport = async (reportData) => {
  const res = await api.post("/api/reports", reportData);
  return res.data; // { status, report_id, message }
};

export const getReports = async () => {
  const res = await api.get("/api/reports");
  return res.data; // { status, data: [...] }
};

export const getReport = async (id) => {
  const res = await api.get(`/api/reports/${id}`);
  return res.data; // { status, data: { raw, parsed, ... } }
};

export const deleteReport = async (id) => {
  const res = await api.delete(`/api/reports/${id}`);
  return res.data;
};

// --- Dashboard Stats API ---

export const getDashboardStats = async () => {
  const res = await api.get("/api/stats");
  return res.data; // { status, data: { total_analyses, avg_score, high_risk_count, recent_activities } }
};

// --- Models API ---

export const getModels = async () => {
  const res = await api.get("/api/models");
  return res.data;
};

export default api;
