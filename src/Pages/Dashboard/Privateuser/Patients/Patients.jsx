import React, { useState, useEffect, useRef, useCallback } from "react";
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

  // Sort state
  const [sortField, setSortField] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Due-only filter
  const [dueOnly, setDueOnly] = useState(false);

  const searchRef = useRef(search);
  const sortFieldRef = useRef(sortField);
  const sortOrderRef = useRef(sortOrder);
  const dueOnlyRef = useRef(dueOnly);

  const [selectedPid, setSelectedPid] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const fetchPatients = useCallback(async (reset = false, querySearch = search, qSortField = sortField, qSortOrder = sortOrder, qDueOnly = dueOnly) => {
    if (loading && !reset) return;

    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;

      const { data } = await axiosSecure.get(
        `/patients/all?page=${currentPage}&limit=20&search=${querySearch}&sort=${qSortField}&order=${qSortOrder}${qDueOnly ? '&dueOnly=true' : ''}`
      );

      // Stale check: abort if search/sort/filter changed while request was in-flight
      if (reset && (querySearch !== searchRef.current || qSortField !== sortFieldRef.current || qSortOrder !== sortOrderRef.current || qDueOnly !== dueOnlyRef.current)) {
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
      if (reset) setPage(2);
      else setPage(prev => prev + 1);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setLoading(false);
    }
  }, [page, search, sortField, sortOrder, dueOnly, loading, axiosSecure]);

  // Re-fetch when search changes
  useEffect(() => {
    searchRef.current = search;
    setPage(1);
    setHasMore(true);
    const timer = setTimeout(() => {
      fetchPatients(true, search, sortField, sortOrder, dueOnly);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when sort or dueOnly filter changes (immediate, no debounce)
  useEffect(() => {
    sortFieldRef.current = sortField;
    sortOrderRef.current = sortOrder;
    dueOnlyRef.current = dueOnly;
    setPatients([]);
    setPage(1);
    setHasMore(true);
    fetchPatients(true, search, sortField, sortOrder, dueOnly);
  }, [sortField, sortOrder, dueOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPatients(false, search, sortField, sortOrder, dueOnly);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [hasMore, loading, fetchPatients]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      // dueAmount sorts descending first (highest due at top)
      setSortOrder(field === "dueAmount" ? "desc" : "asc");
    }
  };

  const handleDueOnlyToggle = () => {
    const next = !dueOnly;
    setDueOnly(next);
    // When enabling due filter, auto-sort by dueAmount desc
    if (next) {
      setSortField("dueAmount");
      setSortOrder("desc");
    }
  };

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

        <PatientFilters
          search={search}
          setSearch={setSearch}
          dueOnly={dueOnly}
          onDueOnlyToggle={handleDueOnlyToggle}
        />
      </div>

      <PatientTable
         patients={patients}
         loading={loading}
         hasMore={hasMore}
         observerTarget={observerTarget}
         handleViewHistory={handleViewHistory}
         sortField={sortField}
         sortOrder={sortOrder}
         onSort={handleSort}
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
