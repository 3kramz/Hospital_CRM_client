import { Link } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="bg-secondary flex flex-col min-h-screen items-center justify-center bg-base-100 px-4 py-16 text-center">
      <div className="flex flex-col items-center space-y-6 max-w-xl">
        <FiAlertTriangle className="text-warning text-6xl" />
        <h1 className="text-4xl md:text-6xl font-bold">404 - Page Not Found</h1>
        <p className="text-lg md:text-xl">
          The link you clicked may be broken or the page may have been removed.
        </p>
       
        <Link
          to="/dashboard"
          className="mt-4 inline-block px-6 py-3 bg-success text-white rounded-lg shadow hover:bg-success/90 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
