import { FaSpinner, FaVials, FaCheckCircle, FaFlask, FaFileMedical } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";

const TestStatusBadge = ({ status }) => {
    const normalize = (str) => String(str || "assigned").toLowerCase();
    const normalizedStatus = normalize(status);
    const displayStatus = String(status || "Assigned").replace(/_/g, " ");

    if (normalizedStatus === "complete") {
      return (
        <span className="text-emerald-600 font-medium text-sm flex items-center justify-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/50">
          <FiCheckCircle className="text-base" /> Done
        </span>
      );
    } else if (normalizedStatus === "running" || normalizedStatus === "test_running") {
      return (
        <span className="text-purple-600 font-medium text-sm flex items-center justify-center gap-1.5 bg-purple-50 px-3 py-1 rounded-full border border-purple-100/50">
           <FaSpinner className="animate-spin text-base" /> Running
        </span>
      );
    } else if (normalizedStatus === "collecting_sample") {
      return (
        <span className="text-orange-600 font-medium text-sm flex items-center justify-center gap-1.5 bg-orange-50 px-3 py-1 rounded-full border border-orange-100/50">
           <FaFlask className="text-base" /> Collecting
        </span>
      );
    } else if (normalizedStatus === "sample_collected") {
       return (
        <span className="text-indigo-600 font-medium text-sm flex items-center justify-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/50">
           <FaVials className="text-base" /> Collected
        </span>
      );
    } else if (normalizedStatus === "ready to deliver" || normalizedStatus === "ready_to_deliver") {
      return (
        <span className="text-blue-600 font-medium text-sm flex items-center justify-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full border border-blue-100/50">
           <FaFileMedical className="text-base" /> Ready
        </span>
      );
    } else if (normalizedStatus === "delivered") {
      return (
        <span className="text-gray-600 font-medium text-sm flex items-center justify-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
           <FaCheckCircle className="text-base" /> Delivered
        </span>
      );
    } else {
      // Default / Assigned
      return (
        <span className="text-amber-600 font-medium text-sm flex items-center justify-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-100/50 capitalize">
           <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> {displayStatus}
        </span>
      );
    }
};

export default TestStatusBadge;
