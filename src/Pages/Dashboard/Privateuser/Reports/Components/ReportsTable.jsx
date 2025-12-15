import { FaSearch } from "react-icons/fa";
import HospitalLoader from "../../../../../Components/Loading/HospitalLoader";
import ReportsTableHeader from './ReportsTableHeader';
import ReportsTableRow from './ReportsTableRow';
import { useNavigate, useLocation } from "react-router-dom";

const ReportsTable = ({ 
    reports, 
    loading, 
    hasMore, 
    lastReportElementRef, 
    handleSort, 
    sortField, 
    sortOrder, 
    searchText, 
    handleStatusUpdate, 
    isFrontDesk 
}) => {
    const navigate = useNavigate();
    const location = useLocation();

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

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <ReportsTableHeader 
                 handleSort={handleSort}
                 sortField={sortField} 
                 sortOrder={sortOrder}
              />
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

                 {reports.map((rpt, idx) => (
                    <ReportsTableRow
                        key={`${rpt._id}-${idx}`}
                        rpt={rpt}
                        idx={idx}
                        isFrontDesk={isFrontDesk}
                        navigate={navigate}
                        location={location}
                        highlightText={highlightText}
                        getStatusColor={getStatusColor}
                        handleStatusUpdate={handleStatusUpdate}
                        reportsLength={reports.length}
                        lastReportElementRef={lastReportElementRef}
                    />
                 ))}

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
    );
};

export default ReportsTable;
