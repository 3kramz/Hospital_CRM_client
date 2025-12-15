import { FaFlask, FaEdit, FaTrash } from "react-icons/fa";

const TestCard = ({ test, onEdit, onDelete }) => {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -mr-12 -mt-12 transition-all group-hover:from-primary/10"></div>
            
            <div className="flex justify-between items-start mb-3 relative z-10">
                <div className={`p-2 rounded-lg ${test.department === 'Hematology' ? 'bg-red-50 text-red-500' : test.department === 'Radiology' ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-500'}`}>
                    <FaFlask className="text-xl" />
                </div>
                <span className="badge badge-sm badge-ghost">{test.department}</span>
            </div>

            <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1" title={test.testName || test.name}>{test.testName || test.name}</h3>
            <p className="text-2xl font-bold text-primary mb-1">৳{test.price}</p>
            <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">Room: <span className="text-gray-600 font-medium">{test.roomNumber || 'N/A'}</span></p>

            <div className="flex gap-2 mt-auto">
                <button onClick={() => onEdit(test)} className="btn btn-sm btn-outline btn-info flex-1 gap-1 group-hover:bg-info group-hover:text-white transition-colors">
                    <FaEdit /> Edit
                </button>
                <button onClick={() => onDelete(test)} className="btn btn-sm btn-outline btn-error flex-1 gap-1 group-hover:bg-error group-hover:text-white transition-colors">
                    <FaTrash />
                </button>
            </div>
        </div>
    );
};

export default TestCard;
