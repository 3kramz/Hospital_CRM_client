import React, { useRef, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const DashboardRevenueChart = ({ chartData, isFetching }) => {
    const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
    const chartContainerRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            if (chartContainerRef.current) {
                const { offsetWidth, offsetHeight } = chartContainerRef.current;
                if (offsetWidth > 0 && offsetHeight > 0) {
                    setChartSize({ width: offsetWidth, height: offsetHeight });
                }
            }
        };

        handleResize();
        const observer = new ResizeObserver(handleResize);
        if (chartContainerRef.current) {
            observer.observe(chartContainerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
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
    );
};

export default DashboardRevenueChart;
