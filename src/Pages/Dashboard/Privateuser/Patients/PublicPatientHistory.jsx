import { useState, useEffect } from "react";
import useAxiosSecure from "../../../../Hook/useAxiosSecure";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PatientHeader from "./Components/PatientHeader";
import PatientStats from "./Components/PatientStats";
import PatientHistoryList from "./Components/PatientHistoryList";

const PublicPatientHistory = () => {
  const { pid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const axiosSecure = useAxiosSecure();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine back path: use state if available, else default to lab-board
  const backPath = location.state?.from?.pathname || "/dashboard/lab-board";

  const handleClose = () => {
      navigate(backPath);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axiosSecure.get(`/patients/${pid}/history`);
        setData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching history:", err);
        setLoading(false);
      }
    };

    if (pid) fetchHistory();
  }, [pid, axiosSecure]);

  if (loading) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
           <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
     );
  }

  if (!data) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-error font-medium">
           Patient not found or error loading data.
           <button onClick={handleClose} className="btn btn-sm btn-outline ml-4">Go Back</button>
        </div>
     );
  }

  return (
    <div 
      className="min-h-screen bg-gray-100 py-10 px-4 cursor-pointer"
      onClick={handleClose}
      title="Click outside to close"
    >
       <div 
         className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden cursor-default"
         onClick={(e) => e.stopPropagation()}
       >
          {/* Header */}
          <PatientHeader patient={data.patient} onClose={handleClose} />

          <div className="p-8">
             {/* Summary Stats */}
             <PatientStats patient={data.patient} />

             {/* History List */}
             <PatientHistoryList history={data.history} />
          </div>
       </div>
    </div>
  );
};

export default PublicPatientHistory;
