import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useUserData = () => {
    const { user, loading, logOut } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: userData, isPending: isUserLoading } = useQuery({
        queryKey: [user?.email, 'userData'],
        enabled: !!user?.email && !loading,
        queryFn: async () => {
            try {
                const res = await axiosSecure.get(`/users/user/${user.email}`);
                if (!res.data) {
                    throw new Error("User profile not found");
                }
                return res.data;
            } catch (error) {
                if (error.response?.status === 404) {
                    localStorage.removeItem("access-token");
                    await logOut();
                }
                throw error;
            }
        }
    });

    return [userData, isUserLoading];
};

export default useUserData;
