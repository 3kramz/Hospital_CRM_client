import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../Hook/useAuth";
import useAdmin from "../Hook/useAdmin";
import HospitalLoader from "../Components/Loading/HospitalLoader";


const AdminRoute = ({ children }) => {
    const { user, loading, logOut } = useAuth();
    const [isAdmin, isAdminLoading] = useAdmin();
    const location = useLocation();
    if (loading || isAdminLoading) {
        return (
             <div className="flex justify-center items-center h-screen bg-background">
                <HospitalLoader />
            </div>
        );
    }

    if (user && isAdmin) {
        return children;
    }


    if (user && !isAdmin) {
        logOut().then(() => {}).catch(err => console.error(err));
        
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // If not authenticated at all, redirect to login
    return <Navigate to="/" state={{ from: location }} replace />;
};

export default AdminRoute;
