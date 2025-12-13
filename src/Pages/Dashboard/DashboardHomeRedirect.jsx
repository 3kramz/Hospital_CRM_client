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

    // If everyone has access to dashboard-home, we can default there.
    return <Navigate to="dashboard-home" replace />;
};

export default DashboardHomeRedirect;
