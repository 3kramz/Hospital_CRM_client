import useAuth from "./useAuth";

const useAdmin = () => {
    // userData is now cached in AuthContext (set during the JWT response),
    // so we don't need a separate API call here at all.
    const { userData, loading } = useAuth();

    const roles = (userData?.roles || (userData?.role ? [userData.role] : []))
        .map((r) => String(r).toLowerCase());

    const isAdmin = roles.includes("admin");
    const isAdminLoading = loading || (!userData && !loading === false);

    return [isAdmin, isAdminLoading];
};

export default useAdmin;
