import React from 'react';

const DashboardFilters = ({ period, setPeriod, dateRange, setDateRange }) => {
    return (
        <div className="flex flex-wrap gap-4 mb-6 items-end">
            <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Filter By</span></label>
                <select 
                    value={period} 
                    onChange={(e) => setPeriod(e.target.value)}
                    className="select select-sm select-bordered w-full max-w-xs"
                >
                    <option value="daily">Today</option>
                    <option value="weekly">This Week</option>
                    <option value="all">All Time</option>
                    <option value="custom">Custom Range</option>
                </select>
            </div>

            {period === 'custom' && (
                <>
                    <div className="form-control">
                        <label className="label py-0"><span className="label-text text-xs">Start Date</span></label>
                        <input 
                            type="date" 
                            value={dateRange.start} 
                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})} 
                            className="input input-sm input-bordered"
                        />
                    </div>
                    <div className="form-control">
                        <label className="label py-0"><span className="label-text text-xs">End Date</span></label>
                        <input 
                            type="date" 
                            value={dateRange.end} 
                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})} 
                            className="input input-sm input-bordered"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardFilters;
