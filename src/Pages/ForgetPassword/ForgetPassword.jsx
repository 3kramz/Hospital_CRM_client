import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../Providers/AuthProvider";
import Swal from "sweetalert2";
import { FaUser, FaArrowLeft } from "react-icons/fa";
import HospitalLoader from "../../Components/Loading/HospitalLoader";

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


// ...

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <HospitalLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="card w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-8 md:p-12">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-primary">Forgot Password?</h1>
            <p className="text-muted mt-2">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          <form onSubmit={onForget} className="space-y-6">
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered w-full pl-10 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                className="btn btn-primary w-full text-white uppercase tracking-wide hover:shadow-lg transition-transform active:scale-95"
              >
                Send Reset Link
              </button>
              
              <Link 
                to="/" 
                className="btn btn-ghost w-full text-muted hover:text-primary gap-2 normal-case font-normal"
              >
                <FaArrowLeft size={12} /> Back to Login
              </Link>
            </div>
          </form>
        </div>
        {/* Footer/Decorative bar */}
        <div className="h-2 bg-gradient-to-r from-primary via-secondary to-info w-full"></div>
      </div>
    </div>
  );
};

export default ForgetPassword;
