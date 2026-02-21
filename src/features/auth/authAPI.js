import axiosInstance from "../../services/axiosInstance";

export const loginAPI = async (payload) => {
  const res = await axiosInstance.post("/auth/login", payload);
  return res.data;
};

export const registerAPI = async (payload) => {
  const res = await axiosInstance.post("/auth/register", payload);
  return res.data;
};
