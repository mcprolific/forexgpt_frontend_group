import axiosInstance from "../../services/axiosInstance";

export const uploadTranscriptAPI = async (payload) => {
  const res = await axiosInstance.post("/transcript/upload", payload);
  return res.data;
};

export const getTranscriptAPI = async (id) => {
  const res = await axiosInstance.get(`/transcript/${id}`);
  return res.data;
};
