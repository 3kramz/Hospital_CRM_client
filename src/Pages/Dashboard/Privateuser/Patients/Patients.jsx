import { useState, useEffect, useRef } from "react";
import useAxiosSecure from "../../../../Hook/useAxiosSecure";
import { FiSearch, FiEye, FiClock, FiPhone, FiUser } from "react-icons/fi";
import PatientHistory from "./PatientHistory";

const Patients = () => {
  const axiosSecure = useAxiosSecure();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  // History Modal State
  const [selectedPid, setSelectedPid] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const fetchPatients = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const { data } = await axiosSecure.get(`/patients/all?page=${currentPage}&limit=20&search=${search}`);
      
      if (reset) {
        setPatients(data.patients);
      } else {
        setPatients(prev => [...prev, ...data.patients]);
      }
      
      setHasMore(data.page < data.totalPages);
      if(reset) setPage(2);
      else setPage(prev => prev + 1);
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setLoading(false);
    }
  };

  // Initial load & Search change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    const delayDebounceFn = setTimeout(() => {
      fetchPatients(true);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPatients(false);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [hasMore, loading]);


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

        {/* Search */}
        <div className="relative w-full sm:w-72">
           <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
              type="text" 
              placeholder="Search by name, phone or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
           />
        </div>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh] hover:overflow-y-auto">
            <table className="w-full text-left relative">
              <thead className="sticky top-0 z-10 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 shadow-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Patient ID</th>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium text-right">Age/Gender</th>
                  <th className="px-6 py-4 font-medium text-right">Total Due</th>
                  <th className="px-6 py-4 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {patients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{patient.pid}</td>
                      <td className="px-6 py-4">
                          <div 
                            onClick={() => handleViewHistory(patient.pid)}
                            className="flex items-center gap-3 cursor-pointer hover:bg-gray-100/50 rounded-lg p-1 -m-1 transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs uppercase group-hover:bg-secondary/20 transition-colors">
                                {patient.name.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-800 group-hover:text-primary transition-colors">{patient.name}</span>
                          </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <FiPhone className="text-gray-400" />
                            {patient.phone}
                          </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">
                          {patient.age} / <span className="uppercase text-xs font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{patient.gender.substring(0,1)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                          <span className={`font-bold ${(patient.dueAmount || 0) > 0 ? "text-red-500" : "text-green-500"}`}>
                            {(patient.dueAmount || 0).toFixed(2)}
                          </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleViewHistory(patient.pid)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <FiClock /> History
                          </button>
                      </td>
                    </tr>
                 ))}
                 
                 {/* Loading Sentinel / Empty State */}
                 <tr ref={observerTarget}>
                    <td colSpan="6" className="text-center py-8">
                       {loading && <span className="loading loading-spinner text-primary"></span>}
                       {!loading && patients.length === 0 && (
                          <span className="text-gray-400">No patients found.</span>
                       )}
                       {!loading && !hasMore && patients.length > 0 && (
                          <span className="text-xs text-gray-300">End of list</span>
                       )}
                    </td>
                 </tr>
              </tbody>
            </table>
          </div>
       </div>

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
