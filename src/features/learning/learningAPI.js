import axiosInstance from "../../services/axiosInstance";

export const getModulesAPI = async () => {
  const res = await axiosInstance.get("/learning/modules");
  return res.data;
};

export const getLessonAPI = async (id) => {
  const res = await axiosInstance.get(`/learning/lessons/${id}`);
  return res.data;
};
