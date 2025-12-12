import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Providers/AuthProvider";
import HospitalLoader from "../Components/Loading/HospitalLoader";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    console.log("PrivateRoute: loading...");
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <HospitalLoader />
      </div>
    );
  }

  if (user) {
    console.log("PrivateRoute: user authorized");
    return children;
  }

  console.log("PrivateRoute: redirecting to login");

  return <Navigate to="/" state={{ from: location }} replace />;
};

export default PrivateRoute;
