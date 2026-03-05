import React from "react";
import { motion as Motion } from "framer-motion";

const StatCard = ({ title, value, icon, className }) => {
  return (
    <Motion.div
      className={`bg-white rounded-xl shadow p-6 flex items-center justify-between ${className}`}
      whileHover={{ scale: 1.05, boxShadow: "0px 20px 25px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <p className="text-gray-500 font-medium">{title}</p>
        <h2 className="text-2xl font-bold mt-1">{value}</h2>
      </div>
      <div className="text-indigo-600 text-3xl">{icon}</div>
    </Motion.div>
  );
};

export default StatCard;
