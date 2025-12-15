import { Link } from 'react-router-dom';
import { FiFile, FiCheckCircle, FiPlay, FiActivity } from 'react-icons/fi';
import { FaFlask } from 'react-icons/fa';

const Th = ({ children, className = "" }) => (
    <th className={`px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider ${className}`}>
        {children}
    </th>
);

const Td = ({ children, className = "" }) => (
    <td className={`px-6 py-4 ${className}`}>
        {children}
    </td>
);

const LabTable = ({ groups, actionType, userData, handleStatusUpdate }) => {
    return (
        <>
            {Object.keys(groups).sort().map(category => (
                <div key={category} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="bg-gray-50/80 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${actionType === 'sample_collected' ? 'bg-primary' : (actionType === 'completed' ? 'bg-success' : 'bg-secondary')}`}></span>
                        <h3 className="font-semibold text-gray-700">{category}</h3>
                        <span className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-500 font-medium">
                            {groups[category].length}
                        </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-gray-50">
                                <tr>
                                    <Th>Invoice ID</Th>
                                    <Th>Patient</Th>
                                    <Th>Test Name</Th>
                                    <Th>Date</Th>
                                    <Th className="text-right">Action</Th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {groups[category].map((item) => (
                                    <tr key={item.uniqueTestInstanceId} className="hover:bg-gray-50 transition-colors group">
                                        <Td className="text-sm font-mono text-gray-500">
                                             #{item._id.slice(-6).toUpperCase()}
                                        </Td>
                                        <Td>
                                            <Link to={`/patient-history/${item.pid}`} className="font-medium text-gray-900 hover:text-secondary transition-colors">
                                                {item.patientName}
                                            </Link>
                                            <div className="text-xs text-gray-500">{item.age}Y • {item.gender} • {item.pid}</div>
                                        </Td>
                                        <Td>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-secondary/5 text-secondary border border-secondary/10">
                                                {item.testName}
                                            </span>
                                        </Td>
                                        <Td className="text-sm text-gray-500">
                                            {new Date(item.date).toLocaleDateString()}
                                            <div className="text-xs text-gray-400">{new Date(item.date).toLocaleTimeString()}</div>
                                        </Td>
                                        <Td className="text-right flex items-center justify-end gap-2">
                                            <Link 
                                                to={`/invoice/${item._id}`}
                                                className="btn btn-xs btn-ghost text-gray-400 hover:text-secondary"
                                                title="View Invoice"
                                            >
                                                <FiFile />
                                            </Link>
                                            
                                            {/* Actions based on Tab & Role */}
                                            {(actionType === 'assigned' || (actionType === 'search' && (!item.status || item.status === 'assigned'))) && (
                                                ((userData?.roles || [userData?.role]).includes('sample_collection') || (userData?.roles || [userData?.role]).includes('admin')) ? (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(item, 'collecting_sample')}
                                                        className="btn btn-sm btn-secondary text-white shadow-sm shadow-secondary/30"
                                                    >
                                                        <FaFlask /> Start Collection
                                                    </button>
                                                ) : <span className="text-xs text-gray-400">Waiting Collection</span>
                                            )}

                                            {(actionType === 'collecting_sample' || (actionType === 'search' && item.status === 'collecting_sample')) && (
                                                ((userData?.roles || [userData?.role]).includes('sample_collection') || (userData?.roles || [userData?.role]).includes('admin')) ? (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(item, 'sample_collected')}
                                                        className="btn btn-sm btn-primary text-white shadow-sm shadow-primary/30"
                                                    >
                                                        <FiCheckCircle /> Sample Collected
                                                    </button>
                                                ) : <span className="text-xs text-info flex items-center gap-1"><FaFlask/> Collecting...</span>
                                            )}

                                            {(actionType === 'sample_collected' || (actionType === 'search' && item.status === 'sample_collected')) && (
                                                ((userData?.roles || [userData?.role]).includes('lab_expert') || (userData?.roles || [userData?.role]).includes('admin')) ? (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(item, 'test_running')}
                                                        className="btn btn-sm btn-accent text-white shadow-sm shadow-accent/30"
                                                    >
                                                        <FiPlay /> Start Test
                                                    </button>
                                                ) : <span className="text-xs text-gray-400">Sample Ready</span>
                                            )}

                                            {(actionType === 'test_running' || (actionType === 'search' && item.status === 'test_running')) && (
                                                ((userData?.roles || [userData?.role]).includes('lab_expert') || (userData?.roles || [userData?.role]).includes('admin')) ? (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(item, 'complete')}
                                                        className="btn btn-sm btn-success text-white shadow-sm shadow-success/30"
                                                    >
                                                        <FiCheckCircle /> Complete Test
                                                    </button>
                                                ) : <span className="text-xs text-info flex items-center gap-1"><FiActivity/> Running...</span>
                                            )}

                                             {(actionType === 'completed' || (actionType === 'search' && item.status === 'complete')) && (
                                                <span className="text-success font-medium text-sm flex items-center justify-end gap-1 px-3 py-1">
                                                    <FiCheckCircle /> Done
                                                </span>
                                            )}
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </>
    );
};

export default LabTable;
