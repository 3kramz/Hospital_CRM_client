import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../Hook/useAuth";
import useAdmin from "../Hook/useAdmin";
import HospitalLoader from "../Components/Loading/HospitalLoader";
import { useEffect } from "react";

const AdminRoute = ({ children }) => {
    const { user, loading, logOut } = useAuth();
    const [isAdmin, isAdminLoading] = useAdmin();
    const location = useLocation();

    // While waiting for auth or admin check, show loader
    if (loading || isAdminLoading) {
        return (
             <div className="flex justify-center items-center h-screen bg-background">
                <HospitalLoader />
            </div>
        );
    }

    // If user is authenticated and is an admin, render children
    if (user && isAdmin) {
        return children;
    }

    // If user is authenticated but NOT an admin, log them out and redirect
    if (user && !isAdmin) {
        // We log them out to force a clean slate, as requested
        logOut().then(() => {
             // Redirect done via Navigate component below, but logging out first ensures 
             // they can't hit 'back' to a protected state easily without re-login.
             // Note: logOut is async/promise based, but here we can just fire and forget 
             // or handle it. Since we return Navigate, React will unmount this component 
             // and mount the login page.
             // However, strictly speaking, Navigate immediately redirects. 
        }).catch(err => console.error(err));
        
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // If not authenticated at all, redirect to login
    return <Navigate to="/" state={{ from: location }} replace />;
};

export default AdminRoute;
