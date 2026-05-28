import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useUser = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: userData, isPending: isUserLoading, refetch } = useQuery({
        queryKey: [user?.email, 'userProfile'],
        enabled: !!user?.email && !loading,
        queryFn: async () => {
             // Retrieve the full user object from the backend
            const res = await axiosSecure.get(`/users/user/${user.email}`);
            return res.data;
        }
    })

    return [userData, isUserLoading, refetch];
};

export default useUser;
