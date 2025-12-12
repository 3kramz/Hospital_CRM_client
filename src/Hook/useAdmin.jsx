import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosSecure from "./useAxiosSecure";

const useAdmin = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: isAdmin, isPending: isAdminLoading } = useQuery({
        queryKey: [user?.email, 'isAdmin'],
        enabled: !!user?.email && !loading, // Wait for auth to be ready
        queryFn: async () => {
             // Retrieve the user object from the backend
            const res = await axiosSecure.get(`/users/user/${user.email}`);
            // Check if the role is 'admin'
            return res.data?.role === 'admin';
        }
    })

    return [isAdmin, isAdminLoading];
};

export default useAdmin;
