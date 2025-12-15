import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosSecure from "../../../../Hook/useAxiosSecure";
import { FiX, FiDollarSign, FiPlusCircle, FiCreditCard } from "react-icons/fi";
import PatientInfoCard from "./Components/PatientInfoCard";
import TransactionHistory from "./Components/TransactionHistory";

const PatientHistory = ({ pid, onClose }) => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (!pid) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
             <div>
                <h2 className="text-xl font-bold text-gray-800">Patient History</h2>
                <div className="flex items-center gap-2 mt-1">
                   <span className="font-mono text-sm px-2 py-0.5 bg-gray-200 rounded text-gray-600 font-bold">{pid}</span>
                </div>
             </div>
             <button 
               onClick={onClose}
               className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
             >
                <FiX className="text-xl" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
             {loading ? (
                <div className="flex justify-center py-20">
                   <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
             ) : data ? (
                <div className="space-y-8">
                   {/* Patient Info Card */}
                   <PatientInfoCard patient={data.patient} />

                    {/* Action Bar */}
                    <div className="flex gap-4">
                       <button 
                          onClick={() => navigate("/dashboard/patient-entry", { state: { patient: data.patient } })}
                          className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20"
                       >
                          <FiPlusCircle /> Assign New Test
                       </button>
                       
                       {(data.patient.dueAmount || 0) > 0 && (
                          <button 
                             onClick={() => navigate("/dashboard/patient-entry", { state: { patient: data.patient } })}
                             className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                          >
                             <FiCreditCard /> Pay Due
                          </button>
                       )}
                    </div>

                   {/* Transaction History */}
                   <div>
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                         <FiDollarSign /> Transaction History
                      </h3>
                      
                      <TransactionHistory history={data.history} />
                   </div>
                </div>
             ) : (
                <div className="text-center text-error">Failed to load data.</div>
             )}
          </div>
       </div>
    </div>
  );
};

export default PatientHistory;
