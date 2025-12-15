import React from 'react';
import { FaFileInvoiceDollar } from "react-icons/fa";

const ReportsHeader = ({ totalCount }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              <span className="flex items-center gap-3 text-gray-900">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                   <FaFileInvoiceDollar className="text-blue-600 text-xl" />
                </div>
                Diagnostic Reports
              </span>
            </h1>
            <p className="text-gray-500 text-sm ml-16">
              Manage patient reports, invoices, and payment statuses efficiently.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all duration-300">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                <FaFileInvoiceDollar />
             </div>
             <div>
               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Invoices</p>
               <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
             </div>
          </div>
        </div>
    );
};

export default ReportsHeader;
