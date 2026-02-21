import axiosInstance from "../../services/axiosInstance";

export const generateStrategyAPI = async (payload) => {
  const res = await axiosInstance.post("/codegen/translate", payload);
  return res.data;
};

export const optimizeStrategyAPI = async (payload) => {
  const res = await axiosInstance.post("/code/optimize", payload);
  return res.data;
};
