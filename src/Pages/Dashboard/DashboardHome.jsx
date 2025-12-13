import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import useAxiosSecure from '../../Hook/useAxiosSecure';
import useUserData from '../../Hook/useUserData';
import HospitalLoader from '../../Components/Loading/HospitalLoader';
import { FiDollarSign, FiActivity, FiCheckCircle, FiClock, FiUsers } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardHome = () => {
    const axiosSecure = useAxiosSecure();
    const [userData] = useUserData();
    const [period, setPeriod] = useState('daily');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const { data: stats, isLoading, isFetching } = useQuery({
        queryKey: ['dashboard-stats', period, dateRange.start, dateRange.end],
        enabled: userData?.role === 'admin',
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

    // Mock data for chart if not available from backend breakdown yet
    // In a real app, backend should return time-series data
    const chartData = [
        { name: 'Revenue', value: stats?.totalRevenue || 0 },
        { name: 'Cash', value: stats?.totalCashReceived || 0 },
        { name: 'Due', value: stats?.totalDueAmount || 0 },
    ];

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
                    title="Total Tests" 
                    value={stats?.totalTests || 0} 
                    icon={<FiActivity />} 
                    color="bg-purple-100 text-purple-600" 
                />
            </div>

            <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 ${isFetching ? 'opacity-50' : ''}`}>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Financial Overview</h2>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
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
