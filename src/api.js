import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://jcs-server-1.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  if (response.data.token) localStorage.setItem("token", response.data.token);
  if (response.data.user) localStorage.setItem("user", JSON.stringify(response.data.user));
  return response.data;
};

export const fetchAllOrders = async () => {
  try {
    const response = await api.get("/orders/all"); 
    return response.data?.orders || response.data?.data || response.data || [];
  } catch (err) {
    return [];
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
    return response.data;
  } catch (err) {
    throw err;
  }
};

// NEW: Submit Feedback
export const submitFeedbackApi = async (orderId, data) => {
  try {
    const response = await api.post(`/orders/${orderId}/feedback`, data);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export default api;