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

const style =
  "flex items-center gap-3 h-12 px-4 w-full text-left text-base font-medium hover:bg-primary hover:text-white rounded transition-all duration-200";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? 80 : 260; // px

  const handleLogout = () => {
    logOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-white py-4 px-6 flex items-center justify-between shadow">
        <h1 className="text-xl md:text-4xl font-bold">JAZEERA DIAGNOSTIC CENTER</h1>
      </header>

      {/* Sidebar Fixed */}
      <aside
        className="fixed top-16 left-0 h-[calc(100vh-64px)] bg-secondary text-primary shadow-md transition-all duration-300 overflow-hidden z-40"
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="flex flex-col pt-4 space-y-1 relative">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute right-2 top-4 bg-info p-1 rounded-full shadow"
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>

          <SidebarItem to="assign-test" icon={<FiUserCheck />} label="TESTS" collapsed={collapsed} />
          <SidebarItem to="patient-entry" icon={<FiUserCheck />} label="Reception" collapsed={collapsed} />
          <SidebarItem to="reports" icon={<FiFileText />} label="Reports" collapsed={collapsed} />
          <SidebarItem to="settings" icon={<FiSettings />} label="Settings" collapsed={collapsed} />
          <SidebarItem to="change-password" icon={<FiLock />} label="Change Password" collapsed={collapsed} />

          <button onClick={handleLogout} className={style}>
            <FiLogOut /> {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className="ml-0 transition-all duration-300 px-4 pt-6"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <div className="pb-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ to, icon, label, collapsed }) => {
  return (
    <Link to={to} className={style}>
      {icon}
      {!collapsed && <span>{label}</span>}
    </Link>
  );
};

export default Dashboard;
