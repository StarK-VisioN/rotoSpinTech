import axios from "axios";

const API_URL = import.meta.env.VITE_APP_BACKEND_URL; 

export const login = async ({ workingId, password }) => {
  return await axios.post(`${API_URL}/api/auth/login`, { workingId, password });
};

export const getProfile = async () => {
  const token = localStorage.getItem("token");
  return await axios.get(`${API_URL}/api/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
