import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../Providers/AuthProvider";
import Swal from "sweetalert2";
import { FaUser } from "react-icons/fa";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const { forgetPassword, loading } = useContext(AuthContext);
  const [email, setEmail] = useState("");

  const onForget = async (e) => {
    e.preventDefault();
    if (!email) return Swal.fire("Please enter your email");

    try {
      await forgetPassword(email);
      Swal.fire({
        title: "Reset mail sent!",
        text: "Please check your email to reset the password.",
        icon: "success",
        confirmButtonText: "OK",
      });
      navigate("/", { replace: true });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message,
        icon: "error",
        confirmButtonText: "Close",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className=" bg-[#213555] flex flex-col md:flex-row justify-center items-center h-screen">
      <div className="lg:w-[500px] w-full mx-auto p-10 rounded-xl mt-6 bg-primary ">
        <img
          src="http://wp.alithemes.com/html/nest/demo/assets/imgs/page/forgot_password.svg"
          alt="Forgot password"
        />
        <h1 className="text-4xl font-bold mt-4 text-[#253D4E] font-lato">
          Forget Your
        </h1>
        <h1 className="text-4xl font-bold mt-2 mb-4 text-[#253D4E] font-lato">
          Password?
        </h1>
        <p className="mb-4 text-gray-600">
          Not to worry, we got you! Let’s get you a new password. Please enter
          your email address.
        </p>
        <form onSubmit={onForget}>
          <div  className="relative">
            <div className=" pl-2 absolute inset-y-0  flex items-center pointer-events-none">
              <FaUser className="text-slate-900" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-transparent border-b-1 border-t-0 border-x-0 rounded-none focus:ring-2 focus:ring-blue-500 focus:rounded-lg focus:outline-none w-full px-3 py-2  text-gray-700 "
              placeholder="Your Email Address"
            />
          </div>
          <div className="flex justify-end  items-center">
            <Link to="/" className=" font-bold mt-3">
              Login here
            </Link>
          </div>
          <button
            type="submit"
            className=" flex justify-center items-center bg-[#8FB7C9] shadow-xl/20 shadow-slate-700 py-2 px-4 border border-slate-700 rounded-4xl    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;
