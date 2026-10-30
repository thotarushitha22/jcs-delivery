import axios from "axios";

const API_BASE = "https://jcs-server-1.onrender.com/api";

export const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }
  return response.data;
};

export const fetchAllOrders = async () => {
  try {
    const response = await axios.get(`${API_BASE}/orders/all`, getAuthConfig()); 
    return response.data?.orders || response.data?.data || response.data || [];
  } catch (err) {
    console.error("Error fetching orders:", err);
    return [];
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await axios.put(
      `${API_BASE}/orders/${orderId}/status`, 
      { status: newStatus }, 
      getAuthConfig()
    );
    return response.data;
  } catch (err) {
    console.error("Error updating status:", err);
    throw err;
  }
};