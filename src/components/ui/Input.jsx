import React from "react";

const Input = React.forwardRef(({ className = "", ...rest }, ref) => (
  <input
    ref={ref}
    {...rest}
    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
  />
));

export default Input;
