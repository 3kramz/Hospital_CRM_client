import { FaVials, FaClipboardList, FaCheckCircle, FaSpinner, FaFlask, FaFileMedical } from "react-icons/fa";

const StatCard = ({ label, count, iconKey, isActive, onClick }) => {
    const normalizedKey = String(iconKey || "").toLowerCase();

    let colorClass = "blue"; // default
    let Icon = FaClipboardList; // default

    if (normalizedKey.includes('complete')) { colorClass = "emerald"; Icon = FaCheckCircle; }
    else if (normalizedKey.includes('run')) { colorClass = "purple"; Icon = FaSpinner; }
    else if (normalizedKey.includes('assign')) { colorClass = "amber"; Icon = FaClipboardList; }
    else if (normalizedKey.includes('collecting')) { colorClass = "orange"; Icon = FaFlask; }
    else if (normalizedKey.includes('collected')) { colorClass = "indigo"; Icon = FaVials; }
    else if (normalizedKey.includes('ready')) { colorClass = "cyan"; Icon = FaFileMedical; }
    else if (normalizedKey.includes('deliver')) { colorClass = "gray"; Icon = FaCheckCircle; }

    const colorMap = {
        emerald: { border: 'border-emerald-500', ring: 'ring-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600', hoverborder: 'hover:border-emerald-200' },
        purple: { border: 'border-purple-500', ring: 'ring-purple-500', bg: 'bg-purple-50', text: 'text-purple-600', hoverborder: 'hover:border-purple-200' },
        amber: { border: 'border-amber-500', ring: 'ring-amber-500', bg: 'bg-amber-50', text: 'text-amber-600', hoverborder: 'hover:border-amber-200' },
        orange: { border: 'border-orange-500', ring: 'ring-orange-500', bg: 'bg-orange-50', text: 'text-orange-600', hoverborder: 'hover:border-orange-200' },
        indigo: { border: 'border-indigo-500', ring: 'ring-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-600', hoverborder: 'hover:border-indigo-200' },
        cyan: { border: 'border-cyan-500', ring: 'ring-cyan-500', bg: 'bg-cyan-50', text: 'text-cyan-600', hoverborder: 'hover:border-cyan-200' },
        gray: { border: 'border-gray-500', ring: 'ring-gray-500', bg: 'bg-gray-50', text: 'text-gray-600', hoverborder: 'hover:border-gray-200' },
        blue: { border: 'border-blue-500', ring: 'ring-blue-500', bg: 'bg-blue-50', text: 'text-blue-600', hoverborder: 'hover:border-blue-200' },
    };
    const theme = colorMap[colorClass] || colorMap.blue;

    return (
        <div 
            onClick={onClick}
            className={`relative overflow-hidden bg-white p-5 rounded-2xl shadow-sm border transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-lg ${isActive ? `ring-2 ${theme.ring} ${theme.border}` : `border-gray-100 ${theme.hoverborder}`}`}
        >
            <div className="flex items-center justify-between z-10 relative">
               <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                  <h3 className="text-3xl font-extrabold text-gray-800">{count}</h3>
               </div>
               <div className={`w-12 h-12 ${theme.bg} rounded-2xl flex items-center justify-center ${theme.text} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm`}>
                  <Icon className={`text-xl ${normalizedKey.includes('run') ? 'animate-spin' : ''}`} />
               </div>
            </div>
            <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${theme.bg} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}></div>
        </div>
    );
};

export default StatCard;
