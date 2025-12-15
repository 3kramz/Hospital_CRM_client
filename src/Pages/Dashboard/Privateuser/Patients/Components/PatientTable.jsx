import PatientTableHeader from './PatientTableHeader';
import PatientTableRow from './PatientTableRow';

const PatientTable = ({ patients, loading, hasMore, observerTarget, handleViewHistory }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="overflow-x-auto max-h-[70vh] hover:overflow-y-auto">
             <table className="w-full text-left relative">
               <PatientTableHeader />
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
    );
};

export default PatientTable;
