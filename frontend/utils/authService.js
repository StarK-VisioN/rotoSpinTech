import axios from "axios";
import { BASE_URL } from "./apiPaths";

export const login = async ({ workingId, password }) => {
  return await axios.post(`${BASE_URL}/api/auth/login`, { workingId, password });
};

export const getProfile = async () => {
  const token = localStorage.getItem("token");
  return await axios.get(`${BASE_URL}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
