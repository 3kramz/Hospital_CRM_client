import {
  FiLogOut,
  FiSettings,
  FiFileText,
  FiLock,
  FiUserCheck,
  FiMenu,
  FiX,
  FiGrid,
  FiUserPlus,
  FiUser,
  FiActivity
} from "react-icons/fi";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../Hook/useAuth";
import useUserData from "../../Hook/useUserData";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logOut } = useAuth();
  const [userData] = useUserData();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    logOut();
    navigate("/");
  };

  const userRole = userData?.role?.toLowerCase();
  const isAdmin = userRole === 'admin';
  const isFrontDesk = userRole === 'front_desk';
  const isLabExpert = userRole === 'lab_expert';
  const isSampleCollection = userRole === 'sample_collection';

  const navItems = [];

  // Front Desk: Patient Entry & Assign Test
  if (isFrontDesk || isAdmin) {
    navItems.push({ to: "assign-test", icon: <FiGrid />, label: "Assign Tests" });
    navItems.push({ to: "patient-entry", icon: <FiUserPlus />, label: "Reception" });
  }

  // All Users (except maybe pure admins if they want less clutter, but Admin usually sees Reports/Patients)
  navItems.push({ to: "reports", icon: <FiFileText />, label: "Reports" });
  navItems.push({ to: "patients", icon: <FiUser />, label: "Patients" });

  // Admin Only: Settings & Overview
  // Admin Only: Settings
  if (isAdmin) {
    navItems.push({ to: "settings", icon: <FiSettings />, label: "Settings" });
  }
  
  // Everyone gets Overview
  navItems.unshift({ to: "dashboard-home", icon: <FiActivity />, label: "Overview" });

  // Lab Stuff
  if (isLabExpert || isSampleCollection) {
    navItems.push({ to: "lab-board", icon: <FiActivity />, label: "Lab Board" });
  }

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Alt + Number to navigate
      if (e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
        const key = parseInt(e.key);
        if (key >= 1 && key <= navItems.length) {
          e.preventDefault();
          const target = navItems[key - 1];
          navigate(target.to);
        }
      }

      // Ctrl + Backspace to Go Back
      if ((e.ctrlKey || e.metaKey) && e.key === "Backspace") {
        // Prevent navigating back if user is typing in an input (preserves Delete Word behavior)
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

        e.preventDefault();
        navigate(-1);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [navigate, navItems]);

  return (
    <div className="min-h-screen bg-light font-outfit flex">
      {/* Sidebar Overlay (Mobile) */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200 shadow-xl lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"}
          flex flex-col
        `}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-center border-b border-gray-100 px-4">
           {isSidebarOpen || isMobile ? (
              <h1 className="text-xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent truncate tracking-tight">
                JAZEERA CRM
              </h1>
           ) : (
             <span className="text-2xl font-bold text-secondary">J</span>
           )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isCollapsed={!isSidebarOpen && !isMobile}
              isActive={location.pathname.includes(item.to)}
            />
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 w-full px-4 py-3 text-red-500 rounded-xl hover:bg-red-50 transition-all
              ${!isSidebarOpen && !isMobile ? "justify-center" : ""}
            `}
          >
            <FiLogOut className="text-xl" />
            {(isSidebarOpen || isMobile) && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-30">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden"
          >
           <FiMenu className="text-2xl" />
          </button>
          
          <button
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="hidden lg:block p-2 text-gray-400 hover:text-primary transition-colors"
          >
             {isSidebarOpen ? <FiMenu className="text-xl transform rotate-180" /> : <FiMenu className="text-xl" />}
          </button>
      

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">
                {userData?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 uppercase">
                {userData?.role || "Member"}
              </p>
            </div>
            
            {userData?.photo ? (
                 <img 
                    src={userData.photo} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                 />
            ) : (
                <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-full flex items-center justify-center font-bold text-lg uppercase">
                  {userData?.name ? userData.name.charAt(0) : "U"}
                </div>
            )}
          </div>
        </header>

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-auto bg-light p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ to, icon, label, isCollapsed, isActive }) => {
  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative
        ${isActive 
          ? "bg-secondary text-white shadow-lg shadow-secondary/30" 
          : "text-gray-500 hover:bg-gray-50 hover:text-primary"
        }
        ${isCollapsed ? "justify-center" : ""}
      `}
    >
      <span className={`text-xl ${isActive ? "text-white" : "group-hover:scale-110 transition-transform"}`}>
        {icon}
      </span>
      
      {!isCollapsed && (
        <span className="font-medium text-sm whitespace-nowrap">{label}</span>
      )}
      
      {/* Tooltip for collapsed mode */}
      {isCollapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
          {label}
        </div>
      )}
    </Link>
  );
};

export default Dashboard;
