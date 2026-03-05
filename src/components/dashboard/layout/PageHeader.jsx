import React from "react";
import { FiX } from "react-icons/fi";

const PageHeader = ({ title, subtitle, action, onClose }) => {
  return (
    <div className="relative flex justify-between items-center bg-black p-4 border-b border-gray-800">

      {/* Left Side */}
      <div>
        <h1 className="text-2xl font-bold text-yellow-400">
          {title}
        </h1>

        {subtitle && (
          <p className="text-white mt-1 text-sm">
            {subtitle}
          </p>
        )}
      </div>

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-white transition"
        >
          {action.icon}
          <span className="font-semibold">{action.label}</span>
        </button>
      )}

      
      
    </div>
  );
};

export default PageHeader;