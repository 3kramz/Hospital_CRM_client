import { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { toast } from "react-toastify";
import useAxiosSecure from "./useAxiosSecure";
import testMasterData from "../lab_test_master_expanded.json";

const useLabBoard = ({ activeTab, searchQuery, selectedDepartment, userData }) => {
    const axiosSecure = useAxiosSecure();

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
        const resolveDepartment = (item) => {
            const fromBill = item.department || "";
            const fromMaster = getTestData(item.testName).department || "";
            return (fromBill || fromMaster || "").trim();
        };

        const matchesDepartment = (item) => {
            const department = resolveDepartment(item);
            const departmentKey = department.toLowerCase();

            // Admin sees all
            if (isAdmin) {
                if (selectedDepartment === "All") return true;
                return department === selectedDepartment;
            }

            // Role based default filter
            if (userDepts.length > 0) {
                if (!department) return false;
                if (!userDepts.includes(departmentKey)) return false;
                if (selectedDepartment !== "All" && department !== selectedDepartment) return false;
                return true;
            }

            // Fallback for users without department restrictions
            if (selectedDepartment === "All") return true;
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

    return {
        queue, isLoading, refetch, handleStatusUpdate,
        runningGroups, assignedGroups, completedGroups, sampleCollectedGroups, collectingGroups, searchGroups,
        departments, activeTabs
    };
};

export default useLabBoard;
