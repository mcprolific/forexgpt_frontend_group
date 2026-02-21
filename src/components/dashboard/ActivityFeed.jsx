import React from "react";
import { motion as Motion } from "framer-motion";

const ActivityFeed = ({ activities }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 max-h-96 overflow-y-auto">
      <h3 className="text-lg font-bold mb-3">Recent Activity</h3>
      <ul>
        {activities.map((activity, index) => (
          <Motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border-b border-gray-200 py-2 flex justify-between items-center"
          >
            <span>{activity.message}</span>
            <span className="text-gray-400 text-sm">{activity.time}</span>
          </Motion.li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;
