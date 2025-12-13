import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useUserData = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: userData, isPending: isUserLoading } = useQuery({
        queryKey: [user?.email, 'userData'],
        enabled: !!user?.email && !loading,
        queryFn: async () => {
            const res = await axiosSecure.get(`/users/user/${user.email}`);
            return res.data;
        }
    });

    return [userData, isUserLoading];
};

export default useUserData;
