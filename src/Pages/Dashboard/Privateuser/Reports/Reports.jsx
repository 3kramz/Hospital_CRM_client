import React, { useEffect, useState, useRef, useCallback } from "react";
import useAxiosSecure from "../../../../Hook/useAxiosSecure";
import useUserData from "../../../../Hook/useUserData";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReportsHeader from "./Components/ReportsHeader";
import ReportsStats from "./Components/ReportsStats";
import ReportsFilters from "./Components/ReportsFilters";
import ReportsTable from "./Components/ReportsTable";

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
    statusCounts: {} 
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
    
  const handleStartDateChange = (e) => {
      setStartDate(e.target.value);
      setReports([]);
      setCurrentPage(1);
      setHasMore(true);
  };

  const handleEndDateChange = (e) => {
      setEndDate(e.target.value);
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

  const handleSort = (field) => {
    const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newOrder);
    setReports([]);
    setCurrentPage(1);
    setHasMore(true);
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
        
        <ReportsHeader totalCount={totalCount} />
        
        <ReportsStats 
            stats={stats} 
            testStatusFilter={testStatusFilter} 
            handleStatClick={handleStatClick} 
        />

        <ReportsFilters
            searchText={searchText}
            onSearchChange={handleSearchChange}
            startDate={startDate}
            onStartDateChange={handleStartDateChange}
            endDate={endDate}
            onEndDateChange={handleEndDateChange}
            paymentStatusFilter={paymentStatusFilter}
            onPaymentStatusChange={handlePaymentStatusChange}
        />

        <ReportsTable
            reports={reports}
            loading={loading}
            hasMore={hasMore}
            lastReportElementRef={lastReportElementRef}
            handleSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
            searchText={searchText}
            handleStatusUpdate={handleStatusUpdate}
            isFrontDesk={isFrontDesk}
        />

      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Reports;
