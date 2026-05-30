import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

const useTests = () => {
    const axiosSecure = useAxiosSecure();

    const { data: testData = {}, isPending: loading } = useQuery({
        queryKey: ["test-list"],
        // Test catalogue changes infrequently — cache for 10 minutes
        staleTime: 10 * 60 * 1000,
        queryFn: async () => {
            const { data } = await axiosSecure.get("/tests/test-list");

            if (!Array.isArray(data)) return data ?? {};

            // Transform flat list → nested { department → category → [...tests] }
            const structured = {};
            data.forEach((test) => {
                const t = {
                    ...test,
                    test_id: test.test_id || test._id || test.code,
                };
                const dept = (t.department || "General")
                    .toLowerCase()
                    .replace(/\s+/g, "_");
                const cat = (t.category || "General")
                    .toLowerCase()
                    .replace(/\s+/g, "_");

                if (!structured[dept]) structured[dept] = {};
                if (!structured[dept][cat]) structured[dept][cat] = [];
                structured[dept][cat].push(t);
            });
            return structured;
        },
    });

    return { testData, loading };
};

export default useTests;
