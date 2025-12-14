import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../Hook/useAuth";
import useUserData from "../Hook/useUserData";
import HospitalLoader from "../Components/Loading/HospitalLoader";

const RoleRoute = ({ children, allowedRoles }) => {
    const { user, loading, logOut } = useAuth();
    const [userData, isUserLoading] = useUserData();
    const location = useLocation();

    if (loading || isUserLoading) {
        return (
             <div className="flex justify-center items-center h-screen bg-background">
                <HospitalLoader />
            </div>
        );
    }

    if (user && userData) {
        // Support array of roles or fallback to single role string
        const userRoles = (userData.roles ? userData.roles : [userData.role]).map(r => r?.toLowerCase());
        
        // Check if ANY of the user's roles matches ANY of the allowed roles
        const hasAccess = userRoles.some(role => allowedRoles.includes(role));

        if (hasAccess) {
            return children;
        } else {
             console.warn("Access Denied. User Roles:", userRoles, "Allowed:", allowedRoles);
             // Redirect to dashboard home instead of logging out
             return <Navigate to="/dashboard/dashboard-home" replace />;
        }
    }

    // Not authenticated or loading
    return <Navigate to="/" state={{ from: location }} replace />;
};

export default RoleRoute;
