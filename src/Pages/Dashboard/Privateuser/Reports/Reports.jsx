import React, { useEffect, useState, useRef, useCallback } from "react";
import useAxiosSecure from "../../../../Hook/useAxiosSecure";
import useUserData from "../../../../Hook/useUserData";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaFileInvoiceDollar, FaEye, FaFilter, FaSpinner, FaSort, FaVials, FaClipboardList, FaCheckCircle, FaFlask, FaFileMedical, FaHandHoldingMedical } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import HospitalLoader from "../../../../Components/Loading/HospitalLoader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [refreshKey, setRefreshKey] = useState(0);
  
  const pageSize = 20;
  const navigate = useNavigate();
  const location = useLocation();
  const axiosSecure = useAxiosSecure();
  const [userData] = useUserData();

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
  }, [axiosSecure, currentPage, searchText, paymentStatusFilter, testStatusFilter, sortField, sortOrder, startDate, endDate, refreshKey]);

  /* Dynamic stats state */
  const [stats, setStats] = useState({
    totalTests: 0,
    statusCounts: {} // Dynamic mappings: { "assigned": 10, "collecting_sample": 5, ... }
  });

  useEffect(() => {
    axiosSecure.get('/tests/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error("Failed to fetch stats:", err));
  }, [axiosSecure, refreshKey]);


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
  /* Helper to render status with icons */
  const renderTestStatus = (status) => {
    const normalize = (str) => String(str || "assigned").toLowerCase();
    const normalizedStatus = normalize(status);
    const displayStatus = String(status || "Assigned").replace(/_/g, " ");

    if (normalizedStatus === "complete") {
      return (
        <span className="text-emerald-600 font-medium text-sm flex items-center justify-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/50">
          <FiCheckCircle className="text-base" /> Done
        </span>
      );
    } else if (normalizedStatus === "running" || normalizedStatus === "test_running") {
      return (
        <span className="text-purple-600 font-medium text-sm flex items-center justify-center gap-1.5 bg-purple-50 px-3 py-1 rounded-full border border-purple-100/50">
           <FaSpinner className="animate-spin text-base" /> Running
        </span>
      );
    } else if (normalizedStatus === "collecting_sample") {
      return (
        <span className="text-orange-600 font-medium text-sm flex items-center justify-center gap-1.5 bg-orange-50 px-3 py-1 rounded-full border border-orange-100/50">
           <FaFlask className="text-base" /> Collecting
        </span>
      );
    } else if (normalizedStatus === "sample_collected") {
       return (
        <span className="text-indigo-600 font-medium text-sm flex items-center justify-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/50">
           <FaVials className="text-base" /> Collected
        </span>
      );
    } else if (normalizedStatus === "ready to deliver" || normalizedStatus === "ready_to_deliver") {
      return (
        <span className="text-blue-600 font-medium text-sm flex items-center justify-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full border border-blue-100/50">
           <FaFileMedical className="text-base" /> Ready
        </span>
      );
    } else if (normalizedStatus === "delivered") {
      return (
        <span className="text-gray-600 font-medium text-sm flex items-center justify-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
           <FaCheckCircle className="text-base" /> Delivered
        </span>
      );
    } else {
      // Default / Assigned
      return (
        <span className="text-amber-600 font-medium text-sm flex items-center justify-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-100/50 capitalize">
           <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> {displayStatus}
        </span>
      );
    }
  };

  const handleStatusUpdate = async (rpt, action) => {
    let newStatus = "";
    if (action === 'ready') newStatus = "ready_to_deliver";
    if (action === 'deliver') newStatus = "delivered";

    if (!newStatus) return;

    try {
        const res = await axiosSecure.patch("/tests/group-status", {
            groupId: rpt._id,
            status: newStatus
        });
        
        if (res.data.success) {
            toast.success(res.data.message);
            
            // Optimistic Update: Update local state immediately without reloading
            setReports(prevReports => prevReports.map(item => 
                item._id === rpt._id ? { ...item, testStatus: newStatus } : item
            ));

            // Silently update stats
            axiosSecure.get('/tests/stats')
                .then(res => setStats(res.data))
                .catch(err => console.error("Failed to update stats silently:", err));
        }
    } catch (err) {
        console.error("Status update failed", err);
        toast.error(err.response?.data?.error || "Failed to update status");
    }
  };

  const isFrontDesk = userData?.role === 'front_desk' || userData?.role === 'admin';

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
               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Invoices</p>
               <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
             </div>
          </div>
        </div>
        
        {/* Stats Section with Modern UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
             {/* Total Tests Card (Always Visible) */}
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

             {/* Dynamic Status Cards */}
             {Object.entries(stats.statusCounts || {}).map(([key, count]) => {
                const normalizedKey = key.toLowerCase();
                // Determine styling based on key
                let colorClass = "blue"; // default
                let Icon = FaClipboardList; // default

                if (normalizedKey.includes('complete')) { colorClass = "emerald"; Icon = FaCheckCircle; }
                else if (normalizedKey.includes('run')) { colorClass = "purple"; Icon = FaSpinner; }
                else if (normalizedKey.includes('assign')) { colorClass = "amber"; Icon = FaClipboardList; }
                else if (normalizedKey.includes('collecting')) { colorClass = "orange"; Icon = FaFlask; }
                else if (normalizedKey.includes('collected')) { colorClass = "indigo"; Icon = FaVials; }
                else if (normalizedKey.includes('ready')) { colorClass = "cyan"; Icon = FaFileMedical; }
                else if (normalizedKey.includes('deliver')) { colorClass = "gray"; Icon = FaCheckCircle; }

                // Tailwind dynamic classes must be full strings or safelisted. Using style object or specific map is safer, but let's try template literals which work if classes are standard.
                // We'll map color names to specific classes to avoid purgedcss issues if not safelisted.
                const colorMap = {
                    emerald: { border: 'border-emerald-500', ring: 'ring-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600', hoverborder: 'hover:border-emerald-200' },
                    purple: { border: 'border-purple-500', ring: 'ring-purple-500', bg: 'bg-purple-50', text: 'text-purple-600', hoverborder: 'hover:border-purple-200' },
                    amber: { border: 'border-amber-500', ring: 'ring-amber-500', bg: 'bg-amber-50', text: 'text-amber-600', hoverborder: 'hover:border-amber-200' },
                    orange: { border: 'border-orange-500', ring: 'ring-orange-500', bg: 'bg-orange-50', text: 'text-orange-600', hoverborder: 'hover:border-orange-200' },
                    indigo: { border: 'border-indigo-500', ring: 'ring-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-600', hoverborder: 'hover:border-indigo-200' },
                    cyan: { border: 'border-cyan-500', ring: 'ring-cyan-500', bg: 'bg-cyan-50', text: 'text-cyan-600', hoverborder: 'hover:border-cyan-200' },
                    gray: { border: 'border-gray-500', ring: 'ring-gray-500', bg: 'bg-gray-50', text: 'text-gray-600', hoverborder: 'hover:border-gray-200' },
                    blue: { border: 'border-blue-500', ring: 'ring-blue-500', bg: 'bg-blue-50', text: 'text-blue-600', hoverborder: 'hover:border-blue-200' },
                };
                const theme = colorMap[colorClass] || colorMap.blue;
                const isActive = testStatusFilter.toLowerCase() === key.toLowerCase() || (key === 'assigned' && testStatusFilter === 'Assigned'); // looser match?
                // Actually the API returns keys as is (lowercase from manual check usually, but let's trust the key)
                // The filter logic expects what? The backend filter seems to use regex or string match.
                
                return (
                 <div 
                    key={key}
                    onClick={() => handleStatClick(key)}
                    className={`relative overflow-hidden bg-white p-5 rounded-2xl shadow-sm border transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-lg ${testStatusFilter.toLowerCase() === key.toLowerCase() ? `ring-2 ${theme.ring} ${theme.border}` : `border-gray-100 ${theme.hoverborder}`}`}
                 >
                    <div className="flex items-center justify-between z-10 relative">
                       <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{key.replace(/_/g, ' ')}</p>
                          <h3 className="text-3xl font-extrabold text-gray-800">{count}</h3>
                       </div>
                       <div className={`w-12 h-12 ${theme.bg} rounded-2xl flex items-center justify-center ${theme.text} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm`}>
                          <Icon className={`text-xl ${normalizedKey.includes('run') ? 'animate-spin' : ''}`} />
                       </div>
                    </div>
                    <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${theme.bg} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}></div>
                 </div>
                );
             })}
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
                            <div className="flex items-center justify-center gap-2">
                                {/* View Report */}
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
                                
                                {/* Front Desk: Ready/Deliver Actions */}
                                {isFrontDesk && String(rpt.testStatus||"").toLowerCase() === 'complete' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusUpdate(rpt, 'ready');
                                        }}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-sm shadow-blue-500/30 transition-all active:scale-95"
                                        title="Mark Report as Ready"
                                    >
                                        <FaFileMedical /> Ready
                                    </button>
                                )}
                                {isFrontDesk && (String(rpt.testStatus||"").toLowerCase() === 'ready to deliver' || String(rpt.testStatus).toLowerCase() === 'ready_to_deliver') && (
                                     <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusUpdate(rpt, 'deliver');
                                        }}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-sm shadow-emerald-500/30 transition-all active:scale-95"
                                        title="Handover Report to Patient"
                                    >
                                        <FaHandHoldingMedical /> Handover
                                    </button>
                                )}
                            </div>
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
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Reports;
