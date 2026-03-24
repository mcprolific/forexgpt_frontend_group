import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser, logoutUser } from "../features/auth/authSlice";

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    const rawUser = typeof localStorage !== "undefined" ? localStorage.getItem("user") : null;
    if (token) {
      try {
        const parsed = rawUser ? JSON.parse(rawUser) : null;
        if (parsed) dispatch(setUser(parsed));
      } catch {
        // ignore parse errors
      }
      setTimeout(() => setLoading(false), 0);
    } else {
      dispatch(logoutUser());
      setTimeout(() => setLoading(false), 0);
    }
  }, [dispatch]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(logoutUser());
    navigate("/login");
  };

  return { loading, logout };
};

export default useAuth;
