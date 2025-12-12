import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const useLabExpert = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { data: isLabExpert, isPending: isLabExpertLoading } = useQuery({
        queryKey: [user?.email, 'isLabExpert'],
        enabled: !loading && !!user?.email,
        queryFn: async () => {
            const res = await axiosSecure.get(`/users/user/${user.email}`);
            return res.data?.role === 'lab_expert';
        }
    })
    return [isLabExpert, isLabExpertLoading];
};

export default useLabExpert;
