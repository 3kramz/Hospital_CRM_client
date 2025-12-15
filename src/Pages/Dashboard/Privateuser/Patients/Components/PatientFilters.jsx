import React from 'react';
import { FiSearch } from "react-icons/fi";

const PatientFilters = ({ search, setSearch }) => {
    return (
        <div className="relative w-full sm:w-72">
           <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
              type="text" 
              placeholder="Search by name, phone or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
           />
        </div>
    );
};

export default PatientFilters;
