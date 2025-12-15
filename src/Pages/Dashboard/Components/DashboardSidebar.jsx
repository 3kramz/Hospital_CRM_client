import React from 'react';
import { NavLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

const DashboardSidebar = ({ 
    isSidebarOpen, 
    isMobile, 
    setIsSidebarOpen, 
    navItems, 
    handleLogout, 
    location 
}) => {
    return (
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
    );
};

const SidebarItem = ({ to, icon, label, isCollapsed, isActive }) => {
    return (
        <NavLink
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
        </NavLink>
    );
};

export default DashboardSidebar;
