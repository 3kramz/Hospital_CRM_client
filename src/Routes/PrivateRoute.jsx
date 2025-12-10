import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Providers/AuthProvider";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    console.log("PrivateRoute: loading...");
    return <progress className="progress w-56 block mx-auto my-10" />;
  }

  if (user) {
    console.log("PrivateRoute: user authorized");
    return children;
  }

  console.log("PrivateRoute: redirecting to login");

  return <Navigate to="/" state={{ from: location }} replace />;
};

export default PrivateRoute;
