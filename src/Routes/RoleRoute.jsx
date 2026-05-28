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
        const userRoles = (userData.roles ? userData.roles : [userData.role]).map(r => r?.toLowerCase());
        const hasAccess = userRoles.some(role => allowedRoles.includes(role));

        if (hasAccess) {
            return children;
        } else {
             console.warn("Access Denied. User Roles:", userRoles, "Allowed:", allowedRoles);
             // Redirect lab/sample roles to lab-board; others to dashboard-home
             const isLabRole = userRoles.some(r => r === 'lab_expert' || r === 'sample_collection');
             return <Navigate to={isLabRole ? "/dashboard/lab-board" : "/dashboard/dashboard-home"} replace />;
        }
    }

    return <Navigate to="/" state={{ from: location }} replace />;
};

export default RoleRoute;
