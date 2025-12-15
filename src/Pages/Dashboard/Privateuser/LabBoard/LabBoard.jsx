import  { useState, useMemo } from 'react';
import useUserData from "../../../../Hook/useUserData";
import useLabBoard from "../../../../Hook/useLabBoard";
import HospitalLoader from "../../../../Components/Loading/HospitalLoader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiSearch, FiClock, FiCheckCircle, FiActivity, FiFileText } from 'react-icons/fi';
import { FaFlask } from 'react-icons/fa';
import LabHeader from './LabHeader';
import LabTabs from './LabTabs';
import LabFilters from './LabFilters';
import LabTable from './LabTable';

const LabBoard = () => {
    const [activeTab, setActiveTab] = useState('assigned'); 
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const [userData] = useUserData();

    const {
        isLoading, refetch, handleStatusUpdate,
        runningGroups, assignedGroups, completedGroups, sampleCollectedGroups, collectingGroups, searchGroups,
        departments, activeTabs
    } = useLabBoard({ activeTab, searchQuery, selectedDepartment, userData });

    
    useMemo(() => {
       if (activeTabs.length > 0 && !activeTabs.includes(activeTab)) {
           setActiveTab(activeTabs[0]);
       }
    }, [activeTabs]);

    if (isLoading) return <HospitalLoader />;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <LabHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Tabs */}
                <LabTabs activeTab={activeTab} setActiveTab={setActiveTab} activeTabs={activeTabs} searchQuery={searchQuery} />
            </div>

            {/* Content */}
            <div className="space-y-8">
                {searchQuery ? (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <FiSearch className="text-secondary" /> Search Results for "{searchQuery}"
                            </h2>
                            <LabFilters selectedDepartment={selectedDepartment} setSelectedDepartment={setSelectedDepartment} departments={departments} />
                        </div>
                        
                        {Object.keys(searchGroups).length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-500 text-sm">No tests found matching your search.</p>
                            </div>
                        ) : <LabTable groups={searchGroups} actionType="search" userData={userData} handleStatusUpdate={handleStatusUpdate} />}
                    </div>
                ) : (
                    <>
                        {activeTab === 'assigned' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                        <FiClock className="text-secondary" /> Assigned for Collection
                                    </h2>
                                    <LabFilters selectedDepartment={selectedDepartment} setSelectedDepartment={setSelectedDepartment} departments={departments} />
                                </div>
                                
                                {Object.keys(assignedGroups).length === 0 ? (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-gray-500 text-sm">No assigned tests pending collection.</p>
                                    </div>
                                ) : <LabTable groups={assignedGroups} actionType="assigned" userData={userData} handleStatusUpdate={handleStatusUpdate} />}
                            </div>
                        )}

                 {activeTab === 'collecting_sample' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <FaFlask className="text-orange-500" /> Collecting Samples
                            </h2>
                            <LabFilters selectedDepartment={selectedDepartment} setSelectedDepartment={setSelectedDepartment} departments={departments} />
                        </div>
                        
                        {Object.keys(collectingGroups).length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-500 text-sm">No samples currently being collected.</p>
                            </div>
                        ) : <LabTable groups={collectingGroups} actionType="collecting_sample" userData={userData} handleStatusUpdate={handleStatusUpdate} />}
                    </div>
                )}

                 {activeTab === 'sample_collected' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <FiCheckCircle className="text-blue-500" /> Samples Collected
                            </h2>
                            <LabFilters selectedDepartment={selectedDepartment} setSelectedDepartment={setSelectedDepartment} departments={departments} />
                        </div>
                        
                        {Object.keys(sampleCollectedGroups).length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-500 text-sm">No samples waiting for analysis.</p>
                            </div>
                        ) : <LabTable groups={sampleCollectedGroups} actionType="sample_collected" userData={userData} handleStatusUpdate={handleStatusUpdate} />}
                    </div>
                )}

                {activeTab === 'test_running' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <FiActivity className="text-purple-500" /> Tests Running
                            </h2>
                            <LabFilters selectedDepartment={selectedDepartment} setSelectedDepartment={setSelectedDepartment} departments={departments} />
                        </div>
                        
                        {Object.keys(runningGroups).length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-500 text-sm">No tests currently running.</p>
                            </div>
                        ) : <LabTable groups={runningGroups} actionType="test_running" userData={userData} handleStatusUpdate={handleStatusUpdate} />}
                    </div>
                )}

                {activeTab === 'completed' && (
                     <div>
                        <div className="flex justify-between items-center mb-4">
                             <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <FiCheckCircle className="text-success" /> Completed Tests
                            </h2>
                            <LabFilters selectedDepartment={selectedDepartment} setSelectedDepartment={setSelectedDepartment} departments={departments} />
                        </div>
                        
                        {Object.keys(completedGroups).length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiFileText className="text-2xl text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No completed tests</h3>
                                <p className="text-gray-500 text-sm">No completed tests matching criteria.</p>
                            </div>
                        ) : <LabTable groups={completedGroups} actionType="completed" userData={userData} handleStatusUpdate={handleStatusUpdate} />}
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
