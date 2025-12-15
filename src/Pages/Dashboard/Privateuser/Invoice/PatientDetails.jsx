import React from "react";

const PatientDetails = ({ patientInfo, createdAt }) => {
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-GB", {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <div className="mb-8 print:mb-2 bg-gray-50/50 p-6 rounded-xl print:p-2 print:bg-transparent print:border print:border-gray-100">
       <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2 print:mb-1 print:pb-1">
           <div className="h-2 w-2 rounded-full bg-blue-500 print:hidden"></div>
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest print:text-[10px]">Bill To</h3>
       </div>
       
       <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 text-sm print:gap-y-1 print:gap-x-4 print:text-[10px]">
          <div className="flex flex-col">
             <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Patient Name</span>
             <span className="font-bold text-gray-800 text-lg leading-none">{patientInfo.name}</span>
          </div>
          <div className="flex flex-col">
             <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Patient ID</span>
             <span className="font-mono font-medium text-gray-700">{patientInfo.pid}</span>
          </div>
           <div className="flex flex-col">
             <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Phone</span>
             <span className="font-medium text-gray-700">{patientInfo.phone || "N/A"}</span>
          </div>
          <div className="flex flex-col">
             <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Age / Gender</span>
             <span className="font-medium text-gray-700">{patientInfo.age} <span className="text-gray-300">|</span> {patientInfo.gender}</span>
          </div>
          <div className="flex flex-col">
             <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Ref. Doctor</span>
             <span className="font-medium text-gray-700 truncate" title={patientInfo.refDoctor}>{patientInfo.refDoctor || "Self"}</span>
          </div> 
          <div className="flex flex-col">
             <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Date</span>
             <span className="font-medium text-gray-700">{formatDate(createdAt)}</span>
          </div>
       </div>
    </div>
  );
};

export default PatientDetails;
