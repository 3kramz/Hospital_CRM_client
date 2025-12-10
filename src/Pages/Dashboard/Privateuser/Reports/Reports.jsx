import React, { useEffect, useState } from "react";
import useAxiosSecure from "../../../../Hook/useAxiosSecure";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFileInvoiceDollar, FaEye, FaChevronLeft, FaChevronRight, FaFilter } from "react-icons/fa";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      axiosSecure
        .get(`/save-patient-bill/all-reports?page=${currentPage}&limit=${pageSize}&search=${searchText}&status=${statusFilter}&payment=${paymentFilter}`)
        .then((res) => {
          setReports(res.data.reports || []);
          setTotalPages(res.data.totalPages || 1);
          setTotalCount(res.data.totalCount || 0);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch reports:", err);
          setLoading(false);
        });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [axiosSecure, currentPage, searchText, statusFilter, paymentFilter]);

  const handleSort = (field) => {
    // Server-side sorting not yet implemented
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Function to highlight search text
  const highlightText = (text) => {
    if (!searchText) return text;
    const regex = new RegExp(`(${searchText})`, "gi");
    const parts = String(text).split(regex);
    return parts.map((part, idx) =>
      regex.test(part) ? (
        <span key={idx} className="bg-yellow-200 text-yellow-800 rounded px-0.5">
          {part}
        </span>
      ) : (
        part
      )
    );
  };
  
  const startIndex = (currentPage - 1) * pageSize;

  return (
    <div className="bg-gray-50 min-h-screen p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
              <FaFileInvoiceDollar className="text-blue-600" />
              Diagnostic Reports
            </h1>
            <p className="text-gray-500 mt-1">Manage and view patient diagnostic reports and invoices.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
             <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Reports</span>
             <div className="text-2xl font-bold text-gray-800">{totalCount}</div>
          </div>
        </div>

        {/* Filters & Actions Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md">
           <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Name, Contact, PID..."
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-3 w-full md:w-auto">
                 <div className="relative w-full md:w-40">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <FaFilter className="text-gray-400 text-xs" />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="block w-full pl-9 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer hover:bg-white transition-colors"
                    >
                      <option value="">All Status</option>
                      <option value="paid">Paid</option>
                      <option value="due">Due</option>
                    </select>
                 </div>
                 <div className="relative w-full md:w-40">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <FaFilter className="text-gray-400 text-xs" />
                    </div>
                    <select
                      value={paymentFilter}
                      onChange={(e) => {
                        setPaymentFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="block w-full pl-9 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer hover:bg-white transition-colors"
                    >
                      <option value="">All Payment</option>
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                 </div>
              </div>
           </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                 <tr>
                   {[
                     { label: "#", field: "serial", align: "center" },
                     { label: "Invoice ID", field: "invoiceId", align: "left" },
                     { label: "Patient ID", field: "patientId", align: "left" },
                     { label: "Name", field: "patientName", align: "left" },
                     { label: "Total Due", field: "totalDue", align: "right" },
                     { label: "Payment", field: "payment", align: "center" },
                     { label: "Status", field: "status", align: "center" },
                     { label: "Action", field: "", align: "center" },
                   ].map(({ label, field, align }) => (
                     <th
                       key={label}
                       scope="col"
                       className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-${align} cursor-pointer hover:text-gray-700 select-none`}
                       onClick={() => field && handleSort(field)}
                     >
                       <div className={`flex items-center ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'} gap-1`}>
                         {label}
                         {sortField === field && (
                           <span className="text-gray-400">{sortOrder === "asc" ? "▲" : "▼"}</span>
                         )}
                       </div>
                     </th>
                   ))}
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {loading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
                          <p>Loading reports...</p>
                        </div>
                      </td>
                    </tr>
                 ) : reports.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-10 text-center text-gray-500 italic">No reports found matching your criteria.</td>
                    </tr>
                 ) : (
                   reports.map((rpt, idx) => (
                     <tr key={rpt.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                         {startIndex + idx + 1}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                         {highlightText(rpt.invoiceId)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                         {highlightText(rpt.patientId)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                         {highlightText(rpt.patientName)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-mono">
                         {rpt.totalDue?.toFixed(2)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                             ${String(rpt.payment > 0 ? "Paid" : "Unpaid").toLowerCase() === "paid" 
                               ? "bg-green-100 text-green-800" 
                               : "bg-gray-100 text-gray-600"}`}>
                             {rpt.payment > 0 ? "Partial/Full" : "Unpaid"} ({rpt.payment})
                          </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                             ${String(rpt.status || "").toLowerCase() === "paid"
                               ? "bg-green-100 text-green-800 border border-green-200"
                               : "bg-red-100 text-red-800 border border-red-200"}`}>
                             {rpt.status}
                          </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-center">
                         <button 
                           onClick={() => navigate(`/invoice/${rpt._id}`)}
                           className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                         >
                           <FaEye /> View
                         </button>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
               Showing <span className="font-medium text-gray-900">{reports.length > 0 ? startIndex + 1 : 0}</span> to <span className="font-medium text-gray-900">{Math.min(startIndex + pageSize, totalCount)}</span> of <span className="font-medium text-gray-900">{totalCount}</span> results
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft className="text-xs" /> Prev
              </button>

              <div className="hidden sm:flex gap-1">
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Simple pagination logic to avoid too many buttons
                    if (totalPages > 7 && Math.abs(page - currentPage) > 2 && page !== 1 && page !== totalPages) {
                       if (Math.abs(page - currentPage) === 3) return <span key={page} className="px-2 py-1">...</span>;
                       return null;
                    }
                    return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            currentPage === page 
                              ? "bg-blue-600 text-white shadow-sm" 
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                    )
                 })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
