import React, { useState, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import useAxiosSecure from "../../../../Hook/useAxiosSecure";
import useUserData from "../../../../Hook/useUserData";
import HospitalLoader from "../../../../Components/Loading/HospitalLoader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiActivity, FiCheckCircle, FiClock, FiPlay, FiSearch, FiFileText, FiFile } from 'react-icons/fi';
import { FaFlask } from 'react-icons/fa';
import testMasterData from "../../../../lab_test_master_expanded.json";

const LabBoard = () => {
    const axiosSecure = useAxiosSecure();
    const [activeTab, setActiveTab] = useState('assigned'); // assigned, collecting_sample, sample_collected, test_running, completed
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const [userData] = useUserData();

    const { data: queue = [], isLoading, refetch } = useQuery({
        queryKey: ['lab-queue', activeTab, searchQuery],
        queryFn: async () => {
             let statusParam = '';
             if (searchQuery) {
                 statusParam = ''; // Fetch all statuses when searching
             }
             else if (activeTab === 'assigned') statusParam = 'assigned';
             else if (activeTab === 'collecting_sample') statusParam = 'collecting_sample';
             else if (activeTab === 'sample_collected') statusParam = 'sample_collected';
             else if (activeTab === 'test_running') statusParam = 'test_running';
             else if (activeTab === 'completed') statusParam = 'complete';

             const encodedSearch = encodeURIComponent(searchQuery);
             const res = await axiosSecure.get(`/tests/lab-queue?status=${statusParam}&search=${encodedSearch}`);
             return res.data;
        },
        placeholderData: keepPreviousData,
        refetchInterval: 120000, // Refetch every 2 minutes
        refetchOnMount: true,    // Refetch on mount
    });

    const handleStatusUpdate = async (test, newStatus) => {
        try {
            const res = await axiosSecure.patch('/tests/status', {
                groupId: test._id,
                testId: test.testId,
                status: newStatus
            });
            if (res.data.success) {
                toast.success(`Test marked as ${newStatus.replace('_', ' ')}`);
                refetch();
            }
        } catch (error) {
            console.error("Error update status:", error);
            toast.error(error.response?.data?.error || 'Failed to update status');
        }
    };

    // Helper to get category & department
    const getTestData = (testName) => {
        const found = testMasterData.find(t => t.name.toLowerCase() === testName.toLowerCase());
        return found || { category: "Uncategorized", department: "Uncategorized" };
    };

    // Extract unique departments for filter
    const departments = useMemo(() => {
        const deps = new Set(testMasterData.map(t => t.department || "Other"));
        return ["All", ...Array.from(deps).sort()];
    }, []);

    // Grouping Logic
    const groupData = (data) => {
        const groups = {};
        data.forEach(item => {
            const { category } = getTestData(item.testName);
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
        });
        return groups;
    };

    const { runningGroups, assignedGroups, completedGroups, sampleCollectedGroups, collectingGroups, searchGroups } = useMemo(() => {
        
        // Prepare User Access Data
        const userRoles = userData?.roles || (userData?.role ? [userData.role] : []);
        // Normalize departments to lowercase for comparison
        const userDepts = (userData?.departments || (userData?.department ? [userData.department] : [])).map(d => d.toLowerCase());
        const isAdmin = userRoles.includes('admin');

        // Filter helper
        const matchesDepartment = (item) => {
             // Admin sees all
             if (isAdmin) {
                 if (selectedDepartment === "All") return true;
                 const { department } = getTestData(item.testName);
                 return department === selectedDepartment;
             }
             
             // Role based default filter
             if (userDepts.length > 0) {
                  const { department } = getTestData(item.testName);
                  if (!department) return false;
                  
                  // Must be in user's allowed departments
                  if (!userDepts.includes(department.toLowerCase())) return false;

                  // Must match UI filter if set
                  if (selectedDepartment !== "All" && department !== selectedDepartment) return false;
                  
                  return true;
             }

             // Fallback for demo users without department set
             if (selectedDepartment === "All") return true;
             const { department } = getTestData(item.testName);
             return department === selectedDepartment;
        };

        const filteredQueue = queue.filter(matchesDepartment);

        // If searching, just group everything
        if (searchQuery) {
             return {
                 searchGroups: groupData(filteredQueue),
                 assignedGroups: {},
                 collectingGroups: {},
                 sampleCollectedGroups: {},
                 runningGroups: {},
                 completedGroups: {}
             };
        }

        return {
            searchGroups: {},
            assignedGroups: groupData(filteredQueue.filter(i => !i.status || i.status === 'assigned')),
            collectingGroups: groupData(filteredQueue.filter(i => i.status === 'collecting_sample')),
            sampleCollectedGroups: groupData(filteredQueue.filter(i => i.status === 'sample_collected')),
            runningGroups: groupData(filteredQueue.filter(i => i.status === 'test_running')),
            completedGroups: groupData(filteredQueue.filter(i => i.status === 'complete')),
        };
    }, [queue, activeTab, selectedDepartment, userData, searchQuery]);

    const activeTabs = useMemo(() => {
        const userRoles = userData?.roles || (userData?.role ? [userData.role] : []);
        
        // Admin sees all
        if (userRoles.includes('admin')) {
             return ['assigned', 'collecting_sample', 'sample_collected', 'test_running', 'completed'];
        }

        const allowedTabs = new Set();
        let hasRestrictedRole = false;

        if (userRoles.includes('sample_collection')) {
             ['assigned', 'collecting_sample', 'sample_collected'].forEach(t => allowedTabs.add(t));
             hasRestrictedRole = true;
        }
        if (userRoles.includes('lab_expert')) {
             ['sample_collected', 'test_running', 'completed'].forEach(t => allowedTabs.add(t));
             hasRestrictedRole = true;
        }

        // If user has restricted roles, return the union of valid tabs
        if (hasRestrictedRole) {
            const flowOrder = ['assigned', 'collecting_sample', 'sample_collected', 'test_running', 'completed'];
            return flowOrder.filter(tab => allowedTabs.has(tab));
        }

        // Default/Fallback (e.g. Front Desk or others) sees all
        return ['assigned', 'collecting_sample', 'sample_collected', 'test_running', 'completed'];
    }, [userData]);

    // Set initial tab based on role if needed, or simple effect
    // But useState default is assigned.
    // If lab expert logs in, they might see empty assigned tab if we don't switch?
    // Let's add an effect to switch if activeTab is not in activeTabs
    
    useMemo(() => {
       if (activeTabs.length > 0 && !activeTabs.includes(activeTab)) {
           setActiveTab(activeTabs[0]);
       }
    }, [activeTabs]);

    if (isLoading) return <HospitalLoader />;

    const renderTable = (groups, actionType) => (
        Object.keys(groups).sort().map(category => (
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
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Invoice ID</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Test Name</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {groups[category].map((item) => (
                                <tr key={item.uniqueTestInstanceId} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-mono text-gray-500">
                                         #{item._id.slice(-6).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link to={`/patient-history/${item.pid}`} className="font-medium text-gray-900 hover:text-secondary transition-colors">
                                            {item.patientName}
                                        </Link>
                                        <div className="text-xs text-gray-500">{item.age}Y • {item.gender} • {item.pid}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-secondary/5 text-secondary border border-secondary/10">
                                            {item.testName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(item.date).toLocaleDateString()}
                                        <div className="text-xs text-gray-400">{new Date(item.date).toLocaleTimeString()}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
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
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ))
    );

    // Department Filter UI Component
    const DeptFilter = () => (
         <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium hidden sm:inline">Filter:</span>
            <select 
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="select select-sm select-bordered max-w-xs rounded-lg focus:outline-none focus:border-secondary bg-white"
            >
                {departments.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                     <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                        <FiActivity className="text-secondary" />
                        Lab Dashboard
                     </h1>
                     <p className="text-gray-500 text-sm mt-1">Manage patient test workflow</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search Inv ID, Name, Test..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input input-bordered w-full pl-10 h-10 rounded-xl focus:outline-none focus:border-secondary"
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
                {!searchQuery && (
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
                        {activeTabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize flex items-center gap-2
                                    ${activeTab === tab 
                                        ? 'bg-white text-secondary shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                                    }
                                `}
                            >
                                {tab === 'assigned' && <FiClock />}
                                {tab === 'collecting_sample' && <FaFlask className="text-orange-500"/>}
                                {tab === 'sample_collected' && <FiCheckCircle className="text-blue-500"/>}
                                {tab === 'test_running' && <FiActivity className="text-purple-500"/>}
                                {tab === 'completed' && <FiCheckCircle className="text-green-500"/>}
                                {tab.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                )}
                </div>
            </div>

            {/* Content */}
            <div className="space-y-8">
                {searchQuery ? (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <FiSearch className="text-secondary" /> Search Results for "{searchQuery}"
                            </h2>
                            <DeptFilter />
                        </div>
                        
                        {Object.keys(searchGroups).length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-500 text-sm">No tests found matching your search.</p>
                            </div>
                        ) : renderTable(searchGroups, 'search')}
                    </div>
                ) : (
                    <>
                        {activeTab === 'assigned' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                        <FiClock className="text-secondary" /> Assigned for Collection
                                    </h2>
                                    <DeptFilter />
                                </div>
                                
                                {Object.keys(assignedGroups).length === 0 ? (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-gray-500 text-sm">No assigned tests pending collection.</p>
                                    </div>
                                ) : renderTable(assignedGroups, 'assigned')}
                            </div>
                        )}

                 {activeTab === 'collecting_sample' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <FaFlask className="text-orange-500" /> Collecting Samples
                            </h2>
                            <DeptFilter />
                        </div>
                        
                        {Object.keys(collectingGroups).length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-500 text-sm">No samples currently being collected.</p>
                            </div>
                        ) : renderTable(collectingGroups, 'collecting_sample')}
                    </div>
                )}

                 {activeTab === 'sample_collected' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <FiCheckCircle className="text-blue-500" /> Samples Collected
                            </h2>
                            <DeptFilter />
                        </div>
                        
                        {Object.keys(sampleCollectedGroups).length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-500 text-sm">No samples waiting for analysis.</p>
                            </div>
                        ) : renderTable(sampleCollectedGroups, 'sample_collected')}
                    </div>
                )}

                {activeTab === 'test_running' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <FiActivity className="text-purple-500" /> Tests Running
                            </h2>
                            <DeptFilter />
                        </div>
                        
                        {Object.keys(runningGroups).length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-500 text-sm">No tests currently running.</p>
                            </div>
                        ) : renderTable(runningGroups, 'test_running')}
                    </div>
                )}

                {activeTab === 'completed' && (
                     <div>
                        <div className="flex justify-between items-center mb-4">
                             <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <FiCheckCircle className="text-success" /> Completed Tests
                            </h2>
                            <DeptFilter />
                        </div>
                        
                        {Object.keys(completedGroups).length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiFileText className="text-2xl text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No completed tests</h3>
                                <p className="text-gray-500 text-sm">No completed tests matching criteria.</p>
                            </div>
                        ) : renderTable(completedGroups, 'completed')}
                    </div>
                )}
                    </>
                )}
            </div>
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default LabBoard;
