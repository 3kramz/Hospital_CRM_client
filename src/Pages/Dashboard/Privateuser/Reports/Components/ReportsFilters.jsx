import { FaSearch, FaFilter } from "react-icons/fa";

const ReportsFilters = ({
    searchText,
    onSearchChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    paymentStatusFilter,
    onPaymentStatusChange
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
           <div className="flex flex-col md:flex-row gap-2 p-2">
              {/* Search */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-300 transition-colors group-focus-within:text-blue-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search patients, invoices..."
                  value={searchText}
                  onChange={onSearchChange}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all duration-200 placeholder-gray-400 font-medium"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                  
                  {/* Date Range Start */}
                  <div className="relative min-w-[150px]">
                      <input 
                        type="date"
                        value={startDate}
                        onChange={onStartDateChange}
                        className="w-full pl-4 pr-4 py-3 bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all duration-200 font-medium text-gray-600 cursor-pointer placeholder-gray-400"
                        placeholder="From Date"
                      />
                  </div>

                  {/* Date Range End */}
                  <div className="relative min-w-[150px]">
                      <input 
                        type="date"
                        value={endDate}
                        onChange={onEndDateChange}
                        className="w-full pl-4 pr-4 py-3 bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all duration-200 font-medium text-gray-600 cursor-pointer placeholder-gray-400"
                        placeholder="To Date"
                      />
                  </div>
                  
                 {/* Payment Status Filter */}
                 <div className="relative min-w-[160px]">
                    <select
                      value={paymentStatusFilter}
                      onChange={onPaymentStatusChange}
                      className="appearance-none w-full pl-4 pr-10 py-3 bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all duration-200 font-medium text-gray-600 cursor-pointer"
                    >
                      <option value="">All Payments</option>
                      <option value="Paid">Paid</option>
                      <option value="Due">Due</option>
                    </select>
                    <FaFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
                 </div>
              </div>
           </div>
        </div>
    );
};

export default ReportsFilters;
