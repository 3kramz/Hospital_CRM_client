import { FiPhone, FiClock } from "react-icons/fi";

const PatientTableRow = ({ patient, handleViewHistory }) => {
    return (
        <tr className="hover:bg-gray-50/50 transition-colors">
            <td className="px-6 py-4 font-mono text-xs text-gray-500">{patient.pid}</td>
            <td className="px-6 py-4">
                <div 
                    onClick={() => handleViewHistory(patient.pid)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-100/50 rounded-lg p-1 -m-1 transition-colors group"
                >
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs uppercase group-hover:bg-secondary/20 transition-colors">
                        {patient.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-800 group-hover:text-primary transition-colors">{patient.name}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <FiPhone className="text-gray-400" />
                    {patient.phone}
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-right text-gray-600">
                {patient.age} / <span className="uppercase text-xs font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{patient.gender.substring(0,1)}</span>
            </td>
            <td className="px-6 py-4 text-right">
                <span className={`font-bold ${(patient.dueAmount || 0) > 0 ? "text-red-500" : "text-green-500"}`}>
                    {(patient.dueAmount || 0).toFixed(2)}
                </span>
            </td>
            <td className="px-6 py-4 text-center">
                <button 
                    onClick={() => handleViewHistory(patient.pid)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                >
                    <FiClock /> History
                </button>
            </td>
        </tr>
    );
};

export default PatientTableRow;
