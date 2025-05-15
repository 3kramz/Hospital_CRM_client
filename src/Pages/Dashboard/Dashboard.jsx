import {
  FiLogOut,
  FiSettings,
  FiFileText,
  FiLock,
  FiUserCheck,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { Link, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../../Hook/useAuth";
import { useState } from "react";
const style = "flex items-center gap-3 h-12 px-4 w-full text-left text-base font-medium  hover:bg-primary hover:text-white rounded transition-all duration-200";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  

  const handleLogout = () => {
    logOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white py-4 px-6 flex items-center justify-between shadow">
        <h1 className="text-xl md:text-4xl font-bold">JAZEERA DIAGNOSTIC CENTER</h1>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`bg-secondary text-primary transition-all duration-300 h-screen overflow-y-auto ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="flex flex-col pt-4 space-y-1 relative">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="absolute right-3 top-4 bg-info p-1 rounded-full shadow"
            >
              {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>

            <SidebarItem to="assign-test" icon={<FiUserCheck />} label="TESTS" collapsed={collapsed} />
            <SidebarItem to="patient-entry" icon={<FiUserCheck />} label="Reception" collapsed={collapsed} />
            <SidebarItem to="patient-bill" icon={<FiFileText />} label="Reception Bill" collapsed={collapsed} />
            <SidebarItem to="reports" icon={<FiFileText />} label="Reports" collapsed={collapsed} />
            <SidebarItem to="settings" icon={<FiSettings />} label="Settings" collapsed={collapsed} />
            <SidebarItem to="change-password" icon={<FiLock />} label="Change Password" collapsed={collapsed} />
            <button onClick={handleLogout} className={style}>
              <FiLogOut /> {!collapsed && <span>Log out</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Sidebar item component
const SidebarItem = ({ to, icon, label, collapsed }) => {
  return (
    <Link
      to={to}
      className={style}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </Link>
  );
};

export default Dashboard;
