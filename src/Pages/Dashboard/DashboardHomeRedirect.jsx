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

    if (userData.role === 'admin') return <Navigate to="dashboard-home" replace />;
    if (userData.role === 'front_desk') return <Navigate to="assign-test" replace />;
    if (userData.role === 'lab_expert' || userData.role === 'sample_collection') return <Navigate to="lab-board" replace />;
    
    return <Navigate to="reports" replace />;
};

export default DashboardHomeRedirect;
