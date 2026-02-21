import React from "react";

const Button = ({ children, className = "", ...rest }) => {
  return (
    <button
      {...rest}
      className={`px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
