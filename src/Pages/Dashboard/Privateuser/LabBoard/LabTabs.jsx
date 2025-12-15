import React from 'react';
import { FiClock, FiCheckCircle, FiActivity } from 'react-icons/fi';
import { FaFlask } from 'react-icons/fa';

const LabTabs = ({ activeTab, setActiveTab, activeTabs, searchQuery }) => {
    if (searchQuery) return null;

    return (
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
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
        </div>
    );
};

export default LabTabs;
