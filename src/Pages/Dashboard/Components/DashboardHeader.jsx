import React from 'react';
import { FiMenu } from "react-icons/fi";

const DashboardHeader = ({ isSidebarOpen, setIsSidebarOpen, userData }) => {
    return (
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

            <div className="flex items-center gap-4 cursor-help" title={userData?.email}>
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
    );
};

export default DashboardHeader;
