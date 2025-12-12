import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        
        {/* Animated 404 text using stroke text effect or just bold */}
        <h1 className="text-9xl font-black text-slate-200 select-none">404</h1>
        
        <div className="relative -mt-16">
           <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">Page Not Found</h2>
           <p className="text-muted text-lg max-w-md mx-auto mb-8">
             Oops! It looks like you've wandered into an restricted area. The page you are looking for might have been removed or is temporarily unavailable.
           </p>
        </div>

        {/* Medical Icon Visualization */}
        <div className="my-8 flex justify-center">
           <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center animate-bounce-slow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
           </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <button 
             onClick={() => navigate(-1)}
             className="btn btn-outline border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800 gap-2 normal-case min-w-[140px]"
          >
            <FiArrowLeft /> Go Back
          </button>
          
          <Link
            to="/dashboard"
            className="btn btn-primary text-white gap-2 normal-case min-w-[140px] shadow-lg shadow-primary/30"
          >
            <FiHome /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
