import React from "react";

const Toast = ({ message, type = "info" }) => {
  const color = type === "error" ? "bg-red-600" : type === "success" ? "bg-green-600" : "bg-indigo-600";
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-white shadow ${color}`}>
      {message}
    </div>
  );
};

export default Toast;
