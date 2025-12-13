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
        const userRole = userData.role?.toLowerCase();
        if (allowedRoles.includes(userRole)) {
            return children;
        }
    }

    // Default: Redirect to dashboard index or login if not found?
    // If authenticated but wrong role, maybe show a "Forbidden" page or redirect.
    // For now, redirecting to login like AdminRoute.
    if (user && userData) {
        const userRole = userData.role?.toLowerCase();
        if (!allowedRoles.includes(userRole)) {
            logOut(); 
            return <Navigate to="/" state={{ from: location }} replace />;
        }
    }

    return <Navigate to="/" state={{ from: location }} replace />;
};

export default RoleRoute;
