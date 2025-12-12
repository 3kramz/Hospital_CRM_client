import React, { useState, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import useAxiosSecure from "../../../../Hook/useAxiosSecure";
import HospitalLoader from "../../../../Components/Loading/HospitalLoader";
import Swal from 'sweetalert2';
import { FiActivity, FiCheckCircle, FiClock, FiPlay, FiSearch, FiFileText, FiFile } from 'react-icons/fi';
import { FaFlask } from 'react-icons/fa';
import testMasterData from "../../../../lab_test_master_expanded.json";

const LabBoard = () => {
    const axiosSecure = useAxiosSecure();
    const [activeTab, setActiveTab] = useState('assigned'); // assigned (includes running), completed
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("All");

    const { data: queue = [], isLoading, refetch } = useQuery({
        queryKey: ['lab-queue', activeTab, searchQuery],
        queryFn: async () => {
             // For assigned tab, we fetch both assigned and running
             const statusParam = activeTab === 'assigned' ? 'assigned,test_running' : 'complete';
             const encodedSearch = encodeURIComponent(searchQuery);
             const res = await axiosSecure.get(`/save-patient-bill/lab-queue?status=${statusParam}&search=${encodedSearch}`);
             return res.data;
        },
        placeholderData: keepPreviousData,
        refetchInterval: 120000, // Refetch every 2 minutes
        refetchOnMount: true,    // Refetch on mount
    });

    const handleStatusUpdate = async (test, newStatus) => {
        try {
            const res = await axiosSecure.patch('/save-patient-bill/status', {
                groupId: test._id,
                testId: test.testId,
                status: newStatus
            });
            if (res.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Status Updated',
                    text: `Test marked as ${newStatus.replace('_', ' ')}`,
                    timer: 1500,
                    showConfirmButton: false
                });
                refetch();
            }
        } catch (error) {
            console.error("Error update status:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update status'
            });
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

    const { runningGroups, assignedGroups, completedGroups } = useMemo(() => {
        // Running tests: NEVER filtered by department (always show urgent tasks)
        const running = queue.filter(item => item.status === 'test_running');
        
        // Filter helper
        const matchesDepartment = (item) => {
             if (selectedDepartment === "All") return true;
             const { department } = getTestData(item.testName);
             return department === selectedDepartment;
        };

        if (activeTab === 'completed') {
            const completed = queue.filter(item => matchesDepartment(item));
            return { completedGroups: groupData(completed), runningGroups: {}, assignedGroups: {} };
        }
        
        // Assigned tests: Filtered by department
        const assigned = queue.filter(item => 
            item.status !== 'test_running' && 
            item.status !== 'complete' &&
            matchesDepartment(item)
        );

        return {
            runningGroups: groupData(running),
            assignedGroups: groupData(assigned),
            completedGroups: {}
        };
    }, [queue, activeTab, selectedDepartment]);

    if (isLoading) return <HospitalLoader />;

    const renderTable = (groups, actionType) => (
        Object.keys(groups).sort().map(category => (
            <div key={category} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="bg-gray-50/80 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${actionType === 'running' ? 'bg-primary' : (actionType === 'completed' ? 'bg-success' : 'bg-secondary')}`}></span>
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
                                        {actionType === 'assigned' && (
                                            <button 
                                                onClick={() => handleStatusUpdate(item, 'test_running')}
                                                className="btn btn-sm btn-primary text-white shadow-sm shadow-primary/30"
                                            >
                                                <FiPlay /> Start
                                            </button>
                                        )}
                                        {actionType === 'running' && (
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 rounded-full border border-purple-100">
                                                    <div className="relative">
                                                        <FaFlask className="text-purple-600 animate-bounce text-sm" />
                                                        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping"></span>
                                                    </div>
                                                    <span className="text-xs font-semibold text-purple-700 animate-pulse">Running...</span>
                                                </div>
                                                <button 
                                                    onClick={() => handleStatusUpdate(item, 'complete')}
                                                    className="btn btn-sm btn-success text-white shadow-sm shadow-success/30"
                                                >
                                                    <FiCheckCircle /> Complete
                                                </button>
                                            </div>
                                        )}
                                         {actionType === 'completed' && (
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

            {/* Controls: Tabs Only */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
                    {['assigned', 'completed'].map((tab) => (
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
                            {tab === 'completed' && <FiCheckCircle />}
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="space-y-8">
                {activeTab === 'assigned' && (
                    <>
                        {/* Running Tests Section */}
                        {Object.keys(runningGroups).length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <FiPlay className="text-primary" /> Tests Running
                                </h2>
                                {renderTable(runningGroups, 'running')}
                            </div>
                        )}

                        {/* Assigned Tests Section */}
                         <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                    <FiClock className="text-secondary" /> Assigned Tests
                                </h2>
                                <DeptFilter />
                            </div>
                            
                            {Object.keys(assignedGroups).length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiFileText className="text-2xl text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">No assigned tests</h3>
                                    <p className="text-gray-500 text-sm">All caught up!</p>
                                </div>
                            ) : renderTable(assignedGroups, 'assigned')}
                        </div>
                    </>
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
            </div>
        </div>
    );
};

export default LabBoard;
