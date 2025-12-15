import { FaVials } from "react-icons/fa";
import StatCard from './StatCard';

const ReportsStats = ({ stats, testStatusFilter, handleStatClick }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
             {/* Total Tests Card (Always Visible) */}
             <div 
                onClick={() => handleStatClick("")}
                className={`relative overflow-hidden bg-white p-5 rounded-2xl shadow-sm border transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-lg ${testStatusFilter === "" ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-100 hover:border-blue-200'}`}
             >
                <div className="flex items-center justify-between z-10 relative">
                   <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Tests</p>
                      <h3 className="text-3xl font-extrabold text-gray-800">{stats.totalTests}</h3>
                   </div>
                   <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                      <FaVials className="text-xl" />
                   </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
             </div>

             {/* Dynamic Status Cards */}
             {Object.entries(stats.statusCounts || {}).map(([key, count]) => (
                <StatCard 
                    key={key}
                    label={key.replace(/_/g, ' ')}
                    count={count}
                    iconKey={key}
                    isActive={testStatusFilter.toLowerCase() === key.toLowerCase()}
                    onClick={() => handleStatClick(key)}
                />
             ))}
        </div>
    );
};

export default ReportsStats;
