import PatientTableHeader from './PatientTableHeader';
import PatientTableRow from './PatientTableRow';
import HospitalLoader from '../../../../../Components/Loading/HospitalLoader';

const PatientTable = ({ patients, loading, hasMore, observerTarget, handleViewHistory, sortField, sortOrder, onSort }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="overflow-x-auto max-h-[70vh] hover:overflow-y-auto">
             <table className="w-full text-left relative">
               <PatientTableHeader
                   sortField={sortField}
                   sortOrder={sortOrder}
                   onSort={onSort}
               />
               <tbody className="divide-y divide-gray-100">
                  {patients.map((patient) => (
                     <PatientTableRow
                        key={patient._id}
                        patient={patient}
                        handleViewHistory={handleViewHistory}
                     />
                  ))}

                  {/* Loading Sentinel / Empty State */}
                  <tr ref={observerTarget}>
                     <td colSpan="6" className="text-center py-8">
                        {loading && (
                            <div className="flex justify-center items-center gap-2 text-gray-400">
                                <span className="loading loading-spinner text-primary"></span>
                                <span className="text-xs font-medium">Loading...</span>
                            </div>
                        )}
                        {!loading && patients.length === 0 && (
                           <span className="text-gray-400">No patients found.</span>
                        )}
                        {!loading && !hasMore && patients.length > 0 && (
                           <span className="text-xs text-gray-300 uppercase tracking-widest">End of list</span>
                        )}
                     </td>
                  </tr>
               </tbody>
             </table>
           </div>
        </div>
    );
};

export default PatientTable;
