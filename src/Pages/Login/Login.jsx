import { useContext, useEffect } from "react";
import { AuthContext } from "../../Providers/AuthProvider";
import LoginForm from "./LoginForm";
import { useNavigate } from "react-router-dom";


const Login = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard/dashboard-home", { replace: true }); // replace prevents going back to login
    }
  }, [user, navigate]); // Dependencies ensure this runs only when user state changes

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      {/* Left Side - Branding */}
      <div className="w-full md:w-1/2 bg-primary flex flex-col justify-center items-center text-white p-10 relative overflow-hidden">
        <div className="z-10 text-center">
          <h1 className="font-bold text-4xl md:text-6xl mb-4 tracking-wider">JAZEERA</h1>
          <p className="text-xl md:text-2xl font-light tracking-widest uppercase">Diagnostic Center</p>
        </div>
        {/* Decorative circle/shape for visual interest */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-info/20 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-8 md:p-14 bg-white md:bg-transparent">
        <div className="w-full max-w-md">
           <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
