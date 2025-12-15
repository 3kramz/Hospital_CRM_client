import { FaEye, FaFileMedical, FaHandHoldingMedical } from "react-icons/fa";
import TestStatusBadge from "./TestStatusBadge";

const ReportsTableRow = ({ 
    rpt, 
    idx, 
    isFrontDesk, 
    navigate, 
    location, 
    highlightText, 
    getStatusColor,
    handleStatusUpdate,
    reportsLength,
    lastReportElementRef
}) => {
    const isLastElement = reportsLength === idx + 1;
    
    return (
        <tr 
            ref={isLastElement ? lastReportElementRef : null}
            className="hover:bg-gray-50/50 transition-colors group"
        >
             {/* Serial */}
             <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                {idx + 1}
             </td>

             {/* Invoice ID */}
             <td className="px-6 py-4 whitespace-nowrap">
                <span 
                  onClick={() => navigate(`/invoice/${rpt._id}`)}
                  className="font-mono text-sm font-medium text-gray-600 hover:text-blue-600 cursor-pointer hover:underline transition-all"
                >
                   {highlightText(rpt.invoiceId)}
                </span>
             </td>

             {/* Patient */}
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
                <TestStatusBadge status={rpt.testStatus} />
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
};

export default ReportsTableRow;
