import axiosInstance from "../../services/axiosInstance";

export const loginAPI = async (payload) => {
  const res = await axiosInstance.post("/login", payload);
  const d = res.data || {};
  const token = d?.tokens?.access_token || null;
  const user = d?.user || null;
  return { token, user };
};

export const registerAPI = async (payload) => {
  const res = await axiosInstance.post("/register", payload);
  const d = res.data || {};
  return {
    user_id: d?.user_id || null,
    email: d?.email || null,
    requires_confirmation: !!d?.requires_confirmation,
  };
};

export const confirmEmailAPI = async (payload) => {
  const res = await axiosInstance.post("/confirm", payload);
  return res.data;
};
