import React from "react";

const InvoiceFooter = ({ enteredBy, user, uniqueRooms }) => {
  return (
    <>
      <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-end print:mt-4 print:pt-2">
         <div className="text-xs text-gray-400">
            <p>
              Authorized by: {enteredBy || user?.displayName }
            </p>
            <p className="mt-1">{new Date().toLocaleString()}</p>
         </div>
         <div className="text-center">
             <div className="w-40 border-t border-gray-300 mb-2"></div>
             <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Authorized Signature</p>
         </div>
      </div>
      
      {/* Sample Collection Rooms */}
      {uniqueRooms && (
         <div className="mt-6 pt-4 border-t border-gray-100 text-center print:mt-4 print:pt-2">
            <p className="text-xs text-gray-500">
               <span className="font-semibold text-gray-700">Sample Collection Room(s):</span> {uniqueRooms}
            </p>
         </div>
      )}

       <div className="mt-6 text-center print:mt-4">
          <p className="text-[10px] text-blue-300 font-medium uppercase tracking-widest">Thank you for choosing Jazeera Diagnostic Center</p>
       </div>
    </>
  );
};

export default InvoiceFooter;
