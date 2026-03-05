import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const { user, token } = useSelector((state) => state.auth);
  const localToken = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;

  if (!user && !(token || localToken)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
