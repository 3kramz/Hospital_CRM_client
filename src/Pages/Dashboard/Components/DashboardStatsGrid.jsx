import { FiDollarSign, FiActivity, FiCheckCircle, FiClock } from 'react-icons/fi';

const DashboardStatsGrid = ({ stats, isFetching }) => {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${isFetching ? 'opacity-50' : ''}`}>
            <StatCard 
                title="Total Revenue" 
                value={`৳${stats?.totalRevenue || 0}`} 
                icon={<FiDollarSign />} 
                color="bg-green-100 text-green-600" 
            />
            <StatCard 
                title="Cash Received" 
                value={`৳${stats?.totalCashReceived || 0}`} 
                icon={<FiCheckCircle />} 
                color="bg-blue-100 text-blue-600" 
            />
            <StatCard 
                title="Due Amount" 
                value={`৳${stats?.totalDueAmount || 0}`} 
                icon={<FiClock />} 
                color="bg-red-100 text-red-600" 
            />
            <StatCard 
                title="Tests Overview" 
                value={stats?.totalTests || 0} 
                icon={<FiActivity />} 
                color="bg-purple-100 text-purple-600" 
            />
            <StatCard 
                title="Running" 
                value={stats?.totalRunning || 0} 
                icon={<FiActivity />} 
                color="bg-indigo-100 text-indigo-600" 
            />
            <StatCard 
                title="Assigned" 
                value={stats?.totalAssigned || 0} 
                icon={<FiActivity />} 
                color="bg-amber-100 text-amber-600" 
            />
            <StatCard 
                title="Completed" 
                value={stats?.totalCompleted || 0} 
                icon={<FiCheckCircle />} 
                color="bg-emerald-100 text-emerald-600" 
            />
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:scale-105">
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
        </div>
        <div className={`p-4 rounded-full ${color} text-2xl`}>
            {icon}
        </div>
    </div>
);

export default DashboardStatsGrid;
