import axiosInstance from "../../services/axiosInstance";

/**
 * Generate strategy code
 */
export const generateCodeAPI = async (payload) => {
  const response = await axiosInstance.post("/codegen/translate", payload);
  return response.data;
};

/**
 * Explain code
 */
export const explainCodeAPI = async (payload) => {
  const response = await axiosInstance.post("/code/explain", payload);
  return response.data;
};

/**
 * Optimize strategy
 */
export const optimizeCodeAPI = async (payload) => {
  const response = await axiosInstance.post("/code/optimize", payload);
  return response.data;
};
