import React from 'react';
import { FiSearch } from "react-icons/fi";
import { FiAlertCircle } from "react-icons/fi";

const PatientFilters = ({ search, setSearch, dueOnly, onDueOnlyToggle }) => {
    return (
        <div className="flex items-center gap-2 w-full sm:w-auto">
           <div className="relative flex-1 sm:w-72">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                 type="text" 
                 placeholder="Search by name, phone or ID..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
              />
           </div>

           {/* Due-only filter toggle */}
           <button
             onClick={onDueOnlyToggle}
             title={dueOnly ? "Showing patients with due — click to clear" : "Show only patients with outstanding due"}
             className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-all whitespace-nowrap ${
               dueOnly
                 ? "bg-red-50 border-red-400 text-red-600 shadow-sm shadow-red-100"
                 : "bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500"
             }`}
           >
             <FiAlertCircle className={dueOnly ? "text-red-500" : "text-gray-400"} />
             With Due
             {dueOnly && (
               <span className="ml-1 w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
             )}
           </button>
        </div>
    );
};

export default PatientFilters;

