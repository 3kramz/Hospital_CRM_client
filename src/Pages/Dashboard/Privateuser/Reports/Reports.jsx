import React, { useEffect, useState, useRef, useCallback } from "react";
import useAxiosSecure from "../../../../Hook/useAxiosSecure";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFileInvoiceDollar, FaEye, FaFilter } from "react-icons/fa";
import HospitalLoader from "../../../../Components/Loading/HospitalLoader";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const pageSize = 20;
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const observer = useRef();
  
  const lastReportElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);


  useEffect(() => {
    setLoading(true);
    
    const delayDebounceFn = setTimeout(() => {
      axiosSecure
        .get(`/save-patient-bill/all-reports?page=${currentPage}&limit=${pageSize}&search=${searchText}&status=${statusFilter}&payment=${paymentFilter}&sort=${sortField}&order=${sortOrder}`)
        .then((res) => {
          const newReports = res.data.reports || [];
          const totalPages = res.data.totalPages || 1;
          
          setReports(prev => {
            // If it's the first page, replace content. Otherwise append.
            if (currentPage === 1) return newReports;
            // Filter duplicates just in case, though ID check is expensive on large arrays so relying on page logic usually fine
             return [...prev, ...newReports];
          });
          
          setTotalCount(res.data.totalCount || 0);
          setHasMore(currentPage < totalPages);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch reports:", err);
          setLoading(false);
        });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [axiosSecure, currentPage, searchText, statusFilter, paymentFilter, sortField, sortOrder]);


  const handleSearchChange = (e) => {
      setSearchText(e.target.value);
      setReports([]); // Optional: clear current view
      setCurrentPage(1);
      setHasMore(true);
  };

  const handleStatusChange = (e) => {
      setStatusFilter(e.target.value);
      setReports([]); 
      setCurrentPage(1);
      setHasMore(true);
  };
    
  const handlePaymentChange = (e) => {
      setPaymentFilter(e.target.value);
       setReports([]); 
      setCurrentPage(1);
      setHasMore(true);
  };

  const handleSort = (field) => {
    const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newOrder);
    setReports([]);
    setCurrentPage(1);
    setHasMore(true);
  };

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
  
  const startIndex = (currentPage - 1) * pageSize; // Only vaguely accurate for infinite scroll if we tracked 'loaded so far', but for row number we can just use index

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
                  onChange={handleSearchChange}
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
                      onChange={handleStatusChange}
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
                      onChange={handlePaymentChange}
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
                 {/* Empty State */}
                 {!loading && reports.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-10 text-center text-gray-500 italic">No reports found matching your criteria.</td>
                    </tr>
                 )}
                 
                 {/* Data Rows */}
                 {reports.map((rpt, idx) => {
                     // Check if this is the last element
                     const isLastElement = reports.length === idx + 1;
                     
                     return (
                     <tr 
                        key={`${rpt.id}-${idx}`} // Using both checks uniqueness
                        ref={isLastElement ? lastReportElementRef : null}
                        className="hover:bg-blue-50/30 transition-colors duration-150 group"
                     >
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                         {idx + 1}
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
                   );
                 })}
                 
                 {/* Loading Indicator for Infinite Scroll */}
                 {loading && (
                    <tr>
                      <td colSpan="8" className="px-6 py-6 transition-all">
                        <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                           <HospitalLoader />
                           <span className="text-xs font-medium uppercase tracking-wider">Loading more reports...</span>
                        </div>
                      </td>
                    </tr>
                 )}
               </tbody>
             </table>
          </div>
          
          {/* Bottom Summary / No More Data */}
          {!hasMore && reports.length > 0 && !loading && (
             <div className="bg-gray-50 px-6 py-4 text-center text-sm text-gray-500 border-t border-gray-200">
                You have reached the end of the list.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
