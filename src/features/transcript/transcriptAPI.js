import axiosInstance from "../../services/axiosInstance";

export const uploadTranscriptAPI = async (payload) => {
  const res = await axiosInstance.post("/transcripts", payload);
  return res.data;
};

export const getTranscriptAPI = async (id) => {
  const res = await axiosInstance.get(`/transcripts/${id}`);
  return res.data;
};
