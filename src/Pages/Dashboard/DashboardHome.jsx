import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import useAxiosSecure from '../../Hook/useAxiosSecure';
import useUserData from '../../Hook/useUserData';
import HospitalLoader from '../../Components/Loading/HospitalLoader';
import { FiDollarSign, FiActivity, FiCheckCircle, FiClock, FiUsers } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const DashboardHome = () => {
    const axiosSecure = useAxiosSecure();
    const [userData] = useUserData();
    const navigate = useNavigate();

    useEffect(() => {
        if (userData) {
             const userRoles = (userData?.roles || (userData?.role ? [userData.role] : [])).map(r => r?.toLowerCase());
             const isAdmin = userRoles.includes('admin');
             const isFrontDesk = userRoles.includes('front_desk');

             if (!isAdmin && !isFrontDesk) {
                 navigate('/dashboard/lab-board');
             }
        }
    }, [userData, navigate]);

    const [period, setPeriod] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
    const chartContainerRef = React.useRef(null);

    useEffect(() => {
        const handleResize = () => {
            if (chartContainerRef.current) {
                const { offsetWidth, offsetHeight } = chartContainerRef.current;
                // Ensure dimensions are positive to avoid warnings
                if (offsetWidth > 0 && offsetHeight > 0) {
                     setChartSize({ width: offsetWidth, height: offsetHeight });
                }
            }
        };

        // Initial measurement
        handleResize();

        // Use ResizeObserver if available
        const observer = new ResizeObserver(handleResize);
        if (chartContainerRef.current) {
            observer.observe(chartContainerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const { data: stats, isLoading, isFetching } = useQuery({
        queryKey: ['dashboard-stats', period, dateRange.start, dateRange.end],
        enabled: !!userData, // Enabled for any logged-in user
        queryFn: async () => {
            let query = `?period=${period}`;
            if (dateRange.start && dateRange.end) {
                query = `?startDate=${dateRange.start}&endDate=${dateRange.end}`;
            }
            const res = await axiosSecure.get(`/tests/dashboard-stats${query}`);
            return res.data;
        },
        placeholderData: keepPreviousData
    });

    if (isLoading) return <HospitalLoader />;

    // Use chartData from backend or fallback to empty array
    const chartData = stats?.chartData || [];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>

            <div className="flex flex-wrap gap-4 mb-6 items-end">
                <div className="form-control">
                    <label className="label py-0"><span className="label-text text-xs">Filter By</span></label>
                    <select 
                        value={period} 
                        onChange={(e) => setPeriod(e.target.value)}
                        className="select select-sm select-bordered w-full max-w-xs"
                    >
                        <option value="daily">Today</option>
                        <option value="weekly">This Week</option>
                        <option value="all">All Time</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>

                {period === 'custom' && (
                    <>
                        <div className="form-control">
                            <label className="label py-0"><span className="label-text text-xs">Start Date</span></label>
                            <input 
                                type="date" 
                                value={dateRange.start} 
                                onChange={(e) => setDateRange({...dateRange, start: e.target.value})} 
                                className="input input-sm input-bordered"
                            />
                        </div>
                        <div className="form-control">
                            <label className="label py-0"><span className="label-text text-xs">End Date</span></label>
                            <input 
                                type="date" 
                                value={dateRange.end} 
                                onChange={(e) => setDateRange({...dateRange, end: e.target.value})} 
                                className="input input-sm input-bordered"
                            />
                        </div>
                    </>
                )}
            </div>

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

            <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 ${isFetching ? 'opacity-50' : ''}`}>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Financial Overview (Trend)</h2>
                <div ref={chartContainerRef} style={{ width: '100%', height: 'calc(100% - 3rem)' }}>
                    {chartSize.width > 0 && chartSize.height > 0 && (
                            <BarChart width={chartSize.width} height={chartSize.height} data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" fill="#4F46E5" name="Revenue" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="cash" fill="#10B981" name="Cash" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="due" fill="#EF4444" name="Due" radius={[4, 4, 0, 0]} />
                            </BarChart>
                    )}
                </div>
            </div>
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

export default DashboardHome;
