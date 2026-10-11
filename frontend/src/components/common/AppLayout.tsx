import { useState } from "react";
import { Outlet } from "react-router";

import Sidebar from "./Sidebar";

function AppLayout() {
  const [collapsed, setCollapsed] =
    useState(false);

  return (
    <div className="min-h-screen bg-[#050816]">
      <Sidebar
        collapsed={collapsed}
        onToggle={() =>
          setCollapsed((current) => !current)
        }
      />

      <main
        className={`min-h-screen transition-all duration-300 ${
          collapsed
            ? "ml-20"
            : "ml-64"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;