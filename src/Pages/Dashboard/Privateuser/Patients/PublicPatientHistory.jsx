import { useState, useEffect } from "react";
import useAxiosSecure from "../../../../Hook/useAxiosSecure";
import { FiCalendar, FiUser, FiInfo, FiX } from "react-icons/fi";
import { useParams, Link, useNavigate } from "react-router-dom";

const PublicPatientHistory = () => {
  const { pid } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
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
        </div>
     );
  }

  return (
    <div 
      className="min-h-screen bg-gray-100 py-10 px-4 cursor-pointer"
      onClick={() => navigate('/dashboard/lab-board')}
      title="Click outside to close"
    >
       <div 
         className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden cursor-default"
         onClick={(e) => e.stopPropagation()}
       >
          {/* Header */}
          <div className="bg-primary p-8 text-white text-center relative">
             <Link 
               to="/dashboard/lab-board" 
               className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
               title="Close and Return to Lab Board"
             >
                <FiX className="text-xl" />
             </Link>
             <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                <FiUser />
             </div>
             <h1 className="text-2xl font-bold">{data.patient.name}</h1>
             <p className="opacity-90 mt-1">{data.patient.pid}</p>
          </div>

          <div className="p-8">
             {/* Summary Stats */}
             {/* Summary Stats */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div>
                   <p className="text-xs text-gray-500 uppercase font-bold">Contact Info</p>
                   <p className="font-bold text-gray-800">{data.patient.phone}</p>
                   <p className="text-sm text-gray-600">{data.patient.email}</p>
                </div>
                <div>
                   <p className="text-xs text-gray-500 uppercase font-bold">Age / Gender</p>
                   <p className="font-bold text-gray-800">{data.patient.age} / {data.patient.gender}</p>
                </div>
                <div className="sm:col-span-2">
                   <p className="text-xs text-gray-500 uppercase font-bold">Address</p>
                   <p className="font-medium text-gray-800">{data.patient.address || "N/A"}</p>
                </div>
                <div>
                   <p className="text-xs text-gray-500 uppercase font-bold">Ref. Doctor</p>
                   <p className="font-medium text-gray-800">{data.patient.refDoctor || "N/A"}</p>
                </div>
                <div>
                   <p className="text-xs text-gray-500 uppercase font-bold">Current Due</p>
                   <p className={`font-bold text-xl ${(data.patient.dueAmount || 0) > 0 ? "text-red-500" : "text-green-500"}`}>
                      ৳ {(data.patient.dueAmount || 0).toFixed(2)}
                   </p>
                </div>
             </div>

             {/* History List */}
             <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                <FiCalendar /> Visit History
             </h3>

             <div className="space-y-6">
                {data.history.length === 0 ? (
                   <p className="text-center text-gray-400 italic">No history found.</p>
                ) : (
                   data.history.map((invoice) => (
                      <div key={invoice._id} className="relative pl-8 before:absolute before:left-3 before:top-8 before:bottom-0 before:w-0.5 before:bg-gray-200 last:before:bg-transparent">
                         <div className="absolute left-0 top-1 w-6 h-6 bg-secondary/20 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-xs text-secondary font-bold">
                         </div>
                         
                         <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                               <div>
                                  <p className="font-bold text-gray-800">
                                     {new Date(invoice.createdAt).toLocaleDateString("en-GB", {
                                        day: 'numeric', month: 'long', year: 'numeric'
                                     })}
                                  </p>
                                  <p className="text-xs text-gray-500">Invoice #{invoice._id.slice(-6).toUpperCase()}</p>
                               </div>
                               <span className={`px-2 py-1 rounded text-xs font-bold ${
                                  (invoice.grandTotal - invoice.payment) <= 0 
                                  ? "bg-green-100 text-green-600" 
                                  : "bg-red-100 text-red-600"
                               }`}>
                                  {(invoice.grandTotal - invoice.payment) <= 0 ? "PAID" : "DUE"}
                               </span>
                            </div>

                            <div className="space-y-1 text-sm text-gray-600 mb-3">
                               {invoice.tests.map((t, idx) => (
                                  <div key={idx} className="flex justify-between">
                                     <span>{t.testName}</span>
                                     <span>৳ {t.price}</span>
                                  </div>
                               ))}
                               {invoice.tests.length === 0 && <span className="italic">Payment Only</span>}
                            </div>
                            
                            <div className="border-t border-gray-100 pt-2 flex justify-between items-center text-sm font-bold">
                               <span className="text-gray-500">Total: ৳ {invoice.grandTotal}</span>
                               <span className="text-green-600">Paid: ৳ {invoice.payment}</span>
                            </div>
                         </div>
                      </div>
                   ))
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

export default PublicPatientHistory;
