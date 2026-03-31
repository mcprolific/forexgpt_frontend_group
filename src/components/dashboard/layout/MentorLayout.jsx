import React from "react";
import { Outlet } from "react-router-dom";

const MentorLayout = () => {
  return (
    <div className="flex flex-1 h-full min-h-0">
      <main className="flex-1 overflow-hidden h-full">
        <Outlet />
      </main>
    </div>
  );
};

export default MentorLayout;
