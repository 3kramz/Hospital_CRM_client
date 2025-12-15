import React from 'react';

const LabFilters = ({ selectedDepartment, setSelectedDepartment, departments }) => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium hidden sm:inline">Filter:</span>
            <select 
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="select select-sm select-bordered max-w-xs rounded-lg focus:outline-none focus:border-secondary bg-white"
            >
                {departments.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                ))}
            </select>
        </div>
    );
};

export default LabFilters;
