import React, { useState, useEffect, useRef } from "react";
import useAxiosSecure from "../../../../Hook/useAxiosSecure";
import PatientHistory from "./PatientHistory";
import PatientFilters from "./Components/PatientFilters";
import PatientTable from "./Components/PatientTable";

const Patients = () => {
  const axiosSecure = useAxiosSecure();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);
  

  const searchRef = useRef(search);

 
  const [selectedPid, setSelectedPid] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  /* 
     Using useCallback to ensure fetchPatients identity is stable unless dependencies change.
     This allows us to safely include it in the useEffect dependency array.
  */
  const fetchPatients = React.useCallback(async (reset = false, querySearch = search) => {
    if (loading && !reset) return;
    
    setLoading(true);
    try {
      // Use the current state 'page' if not resetting. 
      // Note: Since we add 'page' to dependencies, this function recreates when page changes.
      const currentPage = reset ? 1 : page;
      
      const { data } = await axiosSecure.get(`/patients/all?page=${currentPage}&limit=20&search=${querySearch}`);
      
      if (reset && querySearch !== searchRef.current) {
          return;
      }

      if (reset) {
        setPatients(data.patients);
      } else {
        setPatients(prev => {
           const existingIds = new Set(prev.map(p => p._id));
           const newPatients = data.patients.filter(p => !existingIds.has(p._id));
           return [...prev, ...newPatients];
        });
      }
      
      setHasMore(data.page < data.totalPages);
      if(reset) setPage(2);
      else setPage(prev => prev + 1);
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setLoading(false);
    }
  }, [page, search, loading, axiosSecure]);

  useEffect(() => {
    searchRef.current = search; 
    setPage(1);
    setHasMore(true);
    const delayDebounceFn = setTimeout(() => {
      fetchPatients(true, search);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]); // Intentionally omitting fetchPatients to avoid loop, but search is there.

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        // Lower threshold to 0.1 to trigger earlier
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPatients(false);
        }
      },
      { threshold: 0.1 } 
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [hasMore, loading, fetchPatients]); // Added fetchPatients to dependencies


  const handleViewHistory = (pid) => {
    setSelectedPid(pid);
    setIsHistoryOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
       
       <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
          <p className="text-sm text-gray-500">Manage and view patient history</p>
        </div>

        <PatientFilters search={search} setSearch={setSearch} />
       </div>

       <PatientTable 
          patients={patients}
          loading={loading}
          hasMore={hasMore}
          observerTarget={observerTarget}
          handleViewHistory={handleViewHistory}
       />

       {/* History Modal */}
       {isHistoryOpen && (
          <PatientHistory 
             pid={selectedPid} 
             onClose={() => setIsHistoryOpen(false)} 
          />
       )}
    </div>
  );
};

export default Patients;
