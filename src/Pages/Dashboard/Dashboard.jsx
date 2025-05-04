import { FiLogOut, FiSettings, FiFileText, FiLock, FiUserCheck } from "react-icons/fi";
import { Link, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../../Hook/useAuth";
import { useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const style =
    "flex items-center gap-3 h-12 px-4 w-full text-left text-base font-medium text-white hover:bg-info rounded transition-all duration-200";

  const handleLogout = () => {
    logOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white py-4 px-6 flex items-center justify-between md:justify-center shadow">
        <h1 className="text-xl md:text-4xl font-bold text-center">JAZEERA DIAGNOSTIC CENTER</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden block text-white text-2xl"
        >
          ☰
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`bg-secondary text-white w-64 md:block fixed md:relative top-0 left-0 z-50 transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="flex flex-col px-4 pt-6 min-h-screen space-y-3">
            <Link to="patient-entry" className={style}>
              <FiUserCheck /> TESTS
            </Link>
            <Link to="patient-entry" className={style}>
              <FiUserCheck /> Reception
            </Link>
            <Link to="patient-bill" className={style}>
              <FiFileText /> Reception Bill
            </Link>
            <Link to="reports" className={style}>
              <FiFileText /> Reports
            </Link>
            <Link to="settings" className={style}>
              <FiSettings /> Settings
            </Link>
            <Link to="change-password" className={style}>
              <FiLock /> Change Password
            </Link>
            <button onClick={handleLogout} className={style}>
              <FiLogOut /> Log out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
