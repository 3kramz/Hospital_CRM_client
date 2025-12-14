import { Navigate } from "react-router-dom";
import useUserData from "../../Hook/useUserData";
import HospitalLoader from "../../Components/Loading/HospitalLoader";

const DashboardHomeRedirect = () => {
    const [userData, isUserLoading] = useUserData();

    if (isUserLoading) {
         return (
             <div className="flex justify-center items-center h-full">
                <HospitalLoader />
            </div>
        );
    }

    if (!userData) return <Navigate to="/" replace />;
    
    const userRoles = (userData?.roles || (userData?.role ? [userData.role] : [])).map(r => r?.toLowerCase());

    if (userRoles.includes('admin') || userRoles.includes('front_desk')) {
         return <Navigate to="dashboard-home" replace />;
    }

    if (userRoles.includes('lab_expert') || userRoles.includes('sample_collection')) {
         return <Navigate to="lab-board" replace />;
    }

    // Default fallback
    return <Navigate to="dashboard-home" replace />;
};

export default DashboardHomeRedirect;
