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
             const res = await axiosSecure.get(`/users/user/${user.email}`);
             const roles = res.data?.roles || (res.data?.role ? [res.data.role] : []);
             return roles.map(r => String(r).toLowerCase()).includes('admin');
        }
    })

    return [isAdmin, isAdminLoading];
};

export default useAdmin;
