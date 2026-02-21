import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, logoutUser } from "../features/auth/authSlice";
import axiosInstance from "../services/axiosInstance";

const useAuth = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        dispatch(setUser(res.data));
      } catch {
        dispatch(logoutUser());
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch]);

  const logout = () => {
    localStorage.removeItem("token");
    dispatch(logoutUser());
    window.location.href = "/login";
  };

  return { loading, logout };
};

export default useAuth;
