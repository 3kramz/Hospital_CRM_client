import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosSecure from "../../../../Hook/useAxiosSecure";
import { FiX, FiPrinter, FiCalendar, FiDollarSign, FiPlusCircle, FiCreditCard } from "react-icons/fi";

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
                   <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10 flex flex-wrap gap-8 justify-between">
                      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="sm:col-span-2 lg:col-span-1">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Full Name</p>
                          <p className="text-lg font-bold text-gray-800">{data.patient.name}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Contact</p>
                          <p className="text-gray-700">{data.patient.phone}</p>
                          {data.patient.email && <p className="text-xs text-gray-500">{data.patient.email}</p>}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Age / Gender</p>
                          <p className="text-gray-700">{data.patient.age} / {data.patient.gender}</p>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-2">
                           <p className="text-xs font-bold text-gray-400 uppercase mb-1">Address</p>
                           <p className="text-gray-700">{data.patient.address || "N/A"}</p>
                        </div>
                        <div>
                           <p className="text-xs font-bold text-gray-400 uppercase mb-1">Ref. Doctor</p>
                           <p className="text-gray-700">{data.patient.refDoctor || "N/A"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-bold text-gray-400 uppercase mb-1">Current Due</p>
                         <p className={`text-2xl font-bold ${(data.patient.dueAmount || 0) > 0 ? "text-red-500" : "text-green-500"}`}>
                            ৳ {(data.patient.dueAmount || 0).toFixed(2)}
                         </p>
                      </div>
                   </div>

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
                      
                      <div className="space-y-4">
                         {data.history.length === 0 ? (
                            <p className="text-center text-gray-400 py-10 bg-gray-50 rounded-xl italic">
                               No transaction history found.
                            </p>
                         ) : (
                            data.history.map((invoice) => (
                               <div key={invoice._id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                                  <div className="flex justify-between items-start mb-4">
                                     <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                           <FiCalendar />
                                        </div>
                                        <div>
                                           <p className="font-bold text-gray-800 text-sm">
                                              {new Date(invoice.createdAt).toLocaleDateString("en-GB", {
                                                 day: 'numeric', month: 'long', year: 'numeric'
                                              })}
                                           </p>
                                           <p className="text-xs text-gray-400">
                                              {new Date(invoice.createdAt).toLocaleTimeString()}
                                           </p>
                                        </div>
                                     </div>
                                     
                                     <button 
                                        onClick={() => window.open(`${window.location.origin}/invoice/${invoice._id}`, "_blank")}
                                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                     >
                                        <FiPrinter /> Invoice
                                     </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-lg text-sm">
                                     <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Tests</p>
                                        {invoice.tests && invoice.tests.length > 0 ? (
                                           <ul className="space-y-1">
                                              {invoice.tests.map((t, idx) => (
                                                 <li key={idx} className="flex justify-between">
                                                    <span>{t.testName}</span>
                                                    <span className="font-medium text-gray-600">৳ {t.price}</span>
                                                 </li>
                                              ))}
                                           </ul>
                                        ) : (
                                           <span className="text-gray-400 italic">No tests (Payment Only)</span>
                                        )}
                                     </div>
                                     <div className="space-y-2 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
                                        <div className="flex justify-between">
                                           <span className="text-gray-500">Total Amt.</span>
                                           <span className="font-medium">৳ {invoice.grandTotal || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                           <span className="text-gray-500">Paid</span>
                                           <span className="font-bold text-green-600">৳ {invoice.payment || 0}</span>
                                        </div>
                                         <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                                           <span className="text-gray-500 font-bold">Balance</span>
                                           <span className={`font-bold ${(invoice.grandTotal - invoice.payment) > 0 ? "text-red-500" : "text-gray-600"}`}>
                                              ৳ {(invoice.grandTotal - invoice.payment).toFixed(2)}
                                           </span>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            ))
                         )}
                      </div>
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
