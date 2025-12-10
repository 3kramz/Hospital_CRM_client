import { useContext, useEffect } from "react";
import { AuthContext } from "../../Providers/AuthProvider";
import LoginForm from "./LoginForm";
import { useNavigate } from "react-router-dom";


const Login = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();



  useEffect(() => {
    if (user) {
      navigate("/dashboard/patient-entry", { replace: true }); // replace prevents going back to login
    }
  }, [user, navigate]); // Dependencies ensure this runs only when user state changes

  return (
    <div className="min-h-screen flex flex-col md:flex-row justify-center items-center  bg-[#213555] ">
      <div className="flex flex-col bg-[#3C738C]  h-28 w-64 md:h-[300px] md:w-96 justify-center items-center rounded-t-xl md:rounded-l-xl md:rounded-r-none">
        <h1 className=" font-bold text-slate-900 m-4 text-xl md:text-6xl text-center">
          <span className="text-5xl md:text-6xl">JAZEERA</span>
          <br />
          DIAGNOSTIC CENTER
        </h1>
      </div>

      <div className=" bg-[#A7D0E4] flex flex-col justify-center items-center rounded-2xl shadow-[0_35px_35px_rgba(0,0,0,0.30)] ">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
