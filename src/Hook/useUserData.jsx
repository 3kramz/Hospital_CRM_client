import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useUserData = () => {
    const { user, loading, userData: contextUserData, logOut } = useAuth();
    const axiosSecure = useAxiosSecure();

    // If AuthProvider already has the user profile (fetched alongside the JWT),
    // skip the API call entirely.  The query is only enabled as a fallback.
    const { data: fetchedUserData, isPending } = useQuery({
        queryKey: [user?.email, 'userData'],
        enabled: !!user?.email && !loading && !contextUserData,
        staleTime: 5 * 60 * 1000, // treat as fresh for 5 minutes
        queryFn: async () => {
            try {
                const res = await axiosSecure.get(`/users/user/${user.email}`);
                if (!res.data) throw new Error("User profile not found");
                return res.data;
            } catch (error) {
                if (error.response?.status === 404) {
                    localStorage.removeItem("access-token");
                    await logOut();
                }
                throw error;
            }
        },
    });

    const userData = contextUserData || fetchedUserData;
    // Only show loading when we have no data from either source
    const isUserLoading = !contextUserData && (loading || isPending);

    return [userData, isUserLoading];
};

export default useUserData;
