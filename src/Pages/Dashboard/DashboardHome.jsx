import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import useAxiosSecure from '../../Hook/useAxiosSecure';
import useUserData from '../../Hook/useUserData';
import HospitalLoader from '../../Components/Loading/HospitalLoader';
import DashboardStatsGrid from './Components/DashboardStatsGrid';
import DashboardRevenueChart from './Components/DashboardRevenueChart';
import DashboardFilters from './Components/DashboardFilters';

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

            <DashboardFilters 
                period={period} 
                setPeriod={setPeriod} 
                dateRange={dateRange} 
                setDateRange={setDateRange} 
            />

            <DashboardStatsGrid 
                stats={stats} 
                isFetching={isFetching} 
            />

            <DashboardRevenueChart 
                chartData={chartData} 
                isFetching={isFetching} 
            />
        </div>
    );
};

export default DashboardHome;

