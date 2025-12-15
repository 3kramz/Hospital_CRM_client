import React from 'react';
import { FiActivity } from 'react-icons/fi';
import LabSearchBar from './LabSearchBar';

const LabHeader = ({ searchQuery, setSearchQuery }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                 <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                    <FiActivity className="text-secondary" />
                    Lab Dashboard
                 </h1>
                 <p className="text-gray-500 text-sm mt-1">Manage patient test workflow</p>
            </div>
            
            {/* Search Bar */}
            <LabSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>
    );
};

export default LabHeader;
