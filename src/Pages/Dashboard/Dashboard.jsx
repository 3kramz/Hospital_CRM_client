import {
  FiSettings,
  FiFileText,
  FiGrid,
  FiUserPlus,
  FiUser,
  FiActivity
} from "react-icons/fi";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../Hook/useAuth";
import useUserData from "../../Hook/useUserData";
import { useState, useEffect } from "react";
import DashboardSidebar from "./Components/DashboardSidebar";
import DashboardHeader from "./Components/DashboardHeader";

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

  const userRoles = (userData?.roles || (userData?.role ? [userData.role] : [])).map(r => r?.toLowerCase());
  
  const isAdmin = userRoles.includes('admin');
  const isFrontDesk = userRoles.includes('front_desk');
  const isLabExpert = userRoles.includes('lab_expert');
  const isSampleCollection = userRoles.includes('sample_collection');

  const navItems = [];

  // Front Desk: Patient Entry & Assign Test
  if (isFrontDesk || isAdmin) {
    navItems.push({ to: "assign-test", icon: <FiGrid />, label: "Assign Tests" });
    navItems.push({ to: "patient-entry", icon: <FiUserPlus />, label: "Reception" });
  }

  // All Users (except maybe pure admins if they want less clutter, but Admin usually sees Reports/Patients)
  navItems.push({ to: "reports", icon: <FiFileText />, label: "Reports" });
  navItems.push({ to: "patients", icon: <FiUser />, label: "Patients" });

  // Admin Only: Settings
  if (isAdmin) {
    navItems.push({ to: "settings", icon: <FiSettings />, label: "Settings" });
  }
  
  // Overview - Admin & Front Desk Only
  if (isAdmin || isFrontDesk) {
    navItems.unshift({ to: "dashboard-home", icon: <FiActivity />, label: "Overview" });
  }

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
      <DashboardSidebar 
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
        setIsSidebarOpen={setIsSidebarOpen}
        navItems={navItems}
        location={location}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <DashboardHeader 
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            userData={userData}
            handleLogout={handleLogout}
        />

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-auto bg-light p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

