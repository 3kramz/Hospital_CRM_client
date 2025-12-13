import { useContext } from "react";
import { useForm } from "react-hook-form";
import { FaLock, FaUser } from "react-icons/fa";
import { AuthContext } from "../../Providers/AuthProvider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import HospitalLoader from "../../Components/Loading/HospitalLoader";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { signIn, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/dashboard";

  const onSubmit = (data) => {
    signIn(data.email, data.password).then((result) => {
      const user = result.user;

      navigate(from, { replace: true });
    }).catch(err => {
        console.error("Login failed:", err);
        alert("Login failed: " + err.message);
    });
  };




  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <HospitalLoader />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-3xl font-bold text-primary mb-2">Welcome Back</h2>
        <p className="text-muted">Please enter your details to sign in.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="form-control w-full">
          <label className="label" htmlFor="email">
            <span className="label-text font-medium text-dark">Email Address</span>
          </label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                <FaUser />
             </div>
             <input
                id="email"
                type="email"
                {...register("email", { required: "Email is required" })}
                className={`input input-bordered w-full pl-10 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary ${
                  errors.email ? "input-error" : ""
                }`}
                placeholder="Enter your email"
              />
          </div>
          {errors.email && (
            <span className="text-error text-sm mt-1">{errors.email.message}</span>
          )}
        </div>

        <div className="form-control w-full">
           <label className="label" htmlFor="password">
            <span className="label-text font-medium text-dark">Password</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
               <FaLock />
            </div>
            <input
              id="password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className={`input input-bordered w-full pl-10 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary ${
                errors.password ? "input-error" : ""
              }`}
              placeholder="Enter your password"
            />
          </div>
          {errors.password && (
            <span className="text-error text-sm mt-1">{errors.password.message}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
            <div></div> 
            <Link
                to="forget-password"
                className="text-sm font-medium text-secondary hover:text-info transition-colors"
             >
                Forgot password?
            </Link>
        </div>

        <div>
          <button
            type="submit"
            className="btn btn-primary w-full text-white uppercase tracking-wide hover:shadow-lg transition-all transform active:scale-95"
          >
             Sign In
          </button>
        </div>
      </form>
    </div>
  );
};
export default LoginForm;
