import React, { useEffect, useState, useRef, useCallback } from "react";
import useAxiosSecure from "../../../../Hook/useAxiosSecure";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaFileInvoiceDollar, FaEye, FaFilter, FaSpinner, FaSort, FaVials, FaClipboardList, FaCheckCircle, FaFlask } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import HospitalLoader from "../../../../Components/Loading/HospitalLoader";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  // Filters
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(""); // Maps to backend 'status'
  const [testStatusFilter, setTestStatusFilter] = useState(""); // Maps to backend 'testStatus'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const pageSize = 20;
  const navigate = useNavigate();
  const location = useLocation();
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
    
    // Note: backend expects 'status' for payment status (Paid/Due) and 'testStatus' for test status.
    const delayDebounceFn = setTimeout(() => {
      axiosSecure
        .get(`/tests/all-reports?page=${currentPage}&limit=${pageSize}&search=${searchText}&status=${paymentStatusFilter}&testStatus=${testStatusFilter}&sort=${sortField}&order=${sortOrder}&startDate=${startDate}&endDate=${endDate}`)
        .then((res) => {
          const newReports = res.data.reports || [];
          const totalPages = res.data.totalPages || 1;
          
          setReports(prev => {
            if (currentPage === 1) return newReports;
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
  }, [axiosSecure, currentPage, searchText, paymentStatusFilter, testStatusFilter, sortField, sortOrder, startDate, endDate]);

  const [stats, setStats] = useState({
    totalTests: 0,
    totalCompleted: 0,
    totalRunning: 0,
    totalAssigned: 0
  });

  useEffect(() => {
    axiosSecure.get('/save-patient-bill/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error("Failed to fetch stats:", err));
  }, [axiosSecure]);


  const handleSearchChange = (e) => {
      setSearchText(e.target.value);
      setReports([]); 
      setCurrentPage(1);
      setHasMore(true);
  };

  const handlePaymentStatusChange = (e) => {
      setPaymentStatusFilter(e.target.value);
      setReports([]); 
      setCurrentPage(1);
      setHasMore(true);
  };
    
  const handleTestStatusChange = (e) => {
      setTestStatusFilter(e.target.value);
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

  const handleStatClick = (status) => {
     setTestStatusFilter(status);
     setReports([]);
     setCurrentPage(1);
     setHasMore(true);
  }

  const highlightText = (text) => {
    if (!searchText) return text;
    const escapeRegex = (string) => string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(`(${escapeRegex(searchText)})`, "gi");
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

  const getStatusColor = (status) => {
    switch (String(status).toLowerCase()) {
      case "paid":
        return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20";
      case "due":
      case "unpaid":
        return "bg-rose-100 text-rose-700 ring-1 ring-rose-600/20";
      default:
        return "bg-gray-100 text-gray-700 ring-1 ring-gray-600/20";
    }
  };

  /* Helper to render status with icons */
  const renderTestStatus = (status) => {
    const normalizedStatus = String(status || "Assigned").toLowerCase();

    if (normalizedStatus === "complete") {
      return (
        <span className="text-emerald-600 font-medium text-sm flex items-center justify-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/50">
          <FiCheckCircle className="text-base" /> Done
        </span>
      );
    } else if (normalizedStatus === "running") {
      return (
        <span className="text-purple-600 font-medium text-sm flex items-center justify-center gap-1.5 bg-purple-50 px-3 py-1 rounded-full border border-purple-100/50">
           <FaSpinner className="animate-spin text-base" /> Running
        </span>
      );
    } else {
      // Assigned or others
      return (
        <span className="text-amber-600 font-medium text-sm flex items-center justify-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-100/50">
           <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Assigned
        </span>
      );
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen p-6 font-outfit">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
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
               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Reports</p>
               <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
             </div>
          </div>
        </div>
        
        {/* Stats Section with Modern UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
             {/* Total Tests */}
             <div 
                onClick={() => handleStatClick("")}
                className={`relative overflow-hidden bg-white p-5 rounded-2xl shadow-sm border transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-lg ${testStatusFilter === "" ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-100 hover:border-blue-200'}`}
             >
                <div className="flex items-center justify-between z-10 relative">
                   <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Tests</p>
                      <h3 className="text-3xl font-extrabold text-gray-800">{stats.totalTests}</h3>
                   </div>
                   <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                      <FaVials className="text-xl" />
                   </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
             </div>

             {/* Running Tests */}
             <div 
                onClick={() => handleStatClick("Running")}
                className={`relative overflow-hidden bg-white p-5 rounded-2xl shadow-sm border transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-lg ${testStatusFilter === "Running" ? 'ring-2 ring-purple-500 border-purple-500' : 'border-gray-100 hover:border-purple-200'}`}
             >
                <div className="flex items-center justify-between z-10 relative">
                   <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Running</p>
                      <h3 className="text-3xl font-extrabold text-gray-800">{stats.totalRunning}</h3>
                   </div>
                   <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                      <FaFlask className="text-xl group-hover:animate-pulse" />
                   </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
             </div>

             {/* Assigned Tests */}
             <div 
                onClick={() => handleStatClick("Assigned")}
                className={`relative overflow-hidden bg-white p-5 rounded-2xl shadow-sm border transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-lg ${testStatusFilter === "Assigned" ? 'ring-2 ring-amber-500 border-amber-500' : 'border-gray-100 hover:border-amber-200'}`}
             >
                <div className="flex items-center justify-between z-10 relative">
                   <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Assigned</p>
                      <h3 className="text-3xl font-extrabold text-gray-800">{stats.totalAssigned}</h3>
                   </div>
                   <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                      <FaClipboardList className="text-xl" />
                   </div>
                </div>
                 <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
             </div>

             {/* Completed Tests */}
             <div 
                onClick={() => handleStatClick("Complete")}
                className={`relative overflow-hidden bg-white p-5 rounded-2xl shadow-sm border transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-lg ${testStatusFilter === "Complete" ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-gray-100 hover:border-emerald-200'}`}
             >
                <div className="flex items-center justify-between z-10 relative">
                   <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Completed</p>
                      <h3 className="text-3xl font-extrabold text-gray-800">{stats.totalCompleted}</h3>
                   </div>
                   <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                      <FaCheckCircle className="text-xl" />
                   </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
             </div>
        </div>

        {/* Filters & Actions */}
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
                  onChange={handleSearchChange}
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
                        onChange={(e) => {
                            setStartDate(e.target.value);
                            setReports([]);
                            setCurrentPage(1);
                            setHasMore(true);
                        }}
                        className="w-full pl-4 pr-4 py-3 bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all duration-200 font-medium text-gray-600 cursor-pointer placeholder-gray-400"
                        placeholder="From Date"
                      />
                  </div>

                  {/* Date Range End */}
                  <div className="relative min-w-[150px]">
                      <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                            setEndDate(e.target.value);
                            setReports([]);
                            setCurrentPage(1);
                            setHasMore(true);
                        }}
                        className="w-full pl-4 pr-4 py-3 bg-gray-50 border-transparent hover:bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all duration-200 font-medium text-gray-600 cursor-pointer placeholder-gray-400"
                        placeholder="To Date"
                      />
                  </div>
                  
                 {/* Payment Status Filter */}
                 <div className="relative min-w-[160px]">
                    <select
                      value={paymentStatusFilter}
                      onChange={handlePaymentStatusChange}
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

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                   {[
                     { label: "#", field: "serial", align: "center" },
                     { label: "Invoice ID", field: "invoiceId", align: "left" },
                     { label: "Patient", field: "patientName", align: "left" },
                     { label: "Payment", field: "status", align: "center" },
                     { label: "Test Status", field: "testStatus", align: "center" },
                     { label: "Date", field: "createdAt", align: "center" },
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
                           <span className="text-blue-500">{sortOrder === "asc" ? "▲" : "▼"}</span>
                         )}
                       </div>
                     </th>
                   ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {/* Empty State */}
                 {!loading && reports.length === 0 && (
                    <tr>
                       <td colSpan="7" className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center justify-center gap-3">
                             <div className="p-3 bg-gray-50 rounded-full text-gray-300">
                                <FaSearch className="text-xl" />
                             </div>
                             <p className="text-gray-500 font-medium">No reports found</p>
                          </div>
                       </td>
                    </tr>
                 )}

                 {reports.map((rpt, idx) => {
                    const isLastElement = reports.length === idx + 1;
                    return (
                      <tr 
                        key={`${rpt._id}-${idx}`}
                        ref={isLastElement ? lastReportElementRef : null}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                         {/* Serial */}
                         <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            {idx + 1}
                         </td>

                         {/* Invoice ID - REMOVED BORDER/BG per request */}
                         <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              onClick={() => navigate(`/invoice/${rpt._id}`)}
                              className="font-mono text-sm font-medium text-gray-600 hover:text-blue-600 cursor-pointer hover:underline transition-all"
                            >
                               {highlightText(rpt.invoiceId)}
                            </span>
                         </td>

                         {/* Patient - REMOVED AVATAR per request */}
                         <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col cursor-pointer group/patient" onClick={() => navigate(`/patient-history/${rpt.patientId}`, { state: { from: location } })}>
                               <span className="text-sm font-medium text-gray-900 group-hover/patient:text-blue-600 transition-colors">
                                  {highlightText(rpt.patientName)}
                               </span>
                               <span className="text-xs text-gray-400">
                                  {highlightText(rpt.patientId)}
                               </span>
                            </div>
                         </td>

                         {/* Payment Status */}
                         <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(rpt.status)}`}>
                               {rpt.status}
                            </span>
                         </td>

                         {/* Test Status */}
                         <td className="px-6 py-4 whitespace-nowrap text-center">
                            {renderTestStatus(rpt.testStatus)}
                         </td>
                         
                         {/* Date & Time */}
                         <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex flex-col">
                               <span className="text-sm font-medium text-gray-700">
                                  {new Date(rpt.createdAt).toLocaleDateString()}
                               </span>
                               <span className="text-xs text-gray-400">
                                  {new Date(rpt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                            </div>
                         </td>

                         {/* Actions */}
                         <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button 
                              onClick={(e) => {
                                 e.stopPropagation();
                                 navigate(`/invoice/${rpt._id}`);
                              }}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all"
                              title="View Report"
                            >
                              <FaEye />
                            </button>
                         </td>
                      </tr>
                    );
                 })}

                  {/* Loading Indicator */}
                  {loading && (
                    <tr>
                      <td colSpan="7" className="px-6 py-6 transition-all bg-gray-50/30">
                        <div className="flex justify-center gap-2 items-center text-gray-400">
                           <HospitalLoader size="sm" />
                           <span className="text-xs font-medium uppercase tracking-wider">Loading...</span>
                        </div>
                      </td>
                    </tr>
                 )}
              </tbody>
            </table>
          </div>
          
          {/* Footer message */}
          {!hasMore && reports.length > 0 && !loading && (
             <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 text-center text-xs text-gray-400 font-medium uppercase tracking-widest">
                End of List
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
