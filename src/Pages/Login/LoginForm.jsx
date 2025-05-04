import { useContext } from "react";
import { useForm } from "react-hook-form";
import { FaLock, FaUser } from "react-icons/fa";
import { AuthContext } from "../../Providers/AuthProvider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import login_logo from "../../assests/logo/login_logo.svg";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard/patient-entry";

  const onSubmit = (data) => {
    signIn(data.email, data.password).then(() => {
      navigate(from, { replace: true });
      reset();
    });
  };

  return (
    <div className="w-full max-w-md p-8 rounded-lg shadow-md">
      <div className="w-full flex justify-center items-center my-5">
        <img src={login_logo} alt="Login Logo" className="w-10 mx-5" />
        <h2 className="text-4xl font-bold text-center text-gray-800 ">LOGIN</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <div className="relative">
            <div className=" pl-2 absolute inset-y-0 left-0 flex items-center pointer-events-none">
              <FaUser className="text-slate-900" />
            </div>
            <input
              id="email"
              type="text"
              {...register("email", { required: "email is required" })}
              className={`${
                errors.email ? "border-red-700" : "border-black"
              } pl-10 bg-transparent border-b-1 border-t-0 border-x-0 rounded-none focus:ring-2 focus:ring-blue-500 focus:rounded-lg focus:outline-none w-full px-3 py-2  text-gray-700 `}
              placeholder="Enter your email"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-slate-900" />
            </div>
            <input
              id="password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password at least 6 characters",
                },
              })}
              className={`${
                errors.password ? "border-red-700" : "border-black"
              } pl-10 bg-transparent border-b-1 border-t-0 border-x-0 rounded-none focus:ring-2 focus:ring-blue-500 focus:rounded-lg focus:outline-none w-full px-3 py-2  text-gray-700`}
              placeholder="Enter your password"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center">
          <div className="text-sm">
            <Link to="forget-password" className=" hover:text-blue-500">
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <button
            type="submit"
            className=" flex justify-center items-center bg-[#8FB7C9] shadow-xl/20 shadow-slate-700 py-2 px-7 border border-slate-700 rounded-4xl    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaLock className="mr-2" /> SUBMIT
          </button>
        </div>
      </form>
    </div>
  );
};
export default LoginForm;
