import React, { useState, useRef, useEffect } from 'react';
import { FiMenu, FiLogOut, FiChevronDown } from "react-icons/fi";

const DashboardHeader = ({ isSidebarOpen, setIsSidebarOpen, userData, handleLogout }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

            {/* User Avatar + Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-gray-50 transition-colors group"
                    title={userData?.email}
                >
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

                    <FiChevronDown
                        className={`text-gray-400 text-sm transition-transform duration-200 ${
                            dropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
                        <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-800 truncate">{userData?.name || 'User'}</p>
                            <p className="text-xs text-gray-400 truncate">{userData?.email || ''}</p>
                        </div>
                        <button
                            onClick={() => {
                                setDropdownOpen(false);
                                handleLogout();
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <FiLogOut className="text-base" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default DashboardHeader;
