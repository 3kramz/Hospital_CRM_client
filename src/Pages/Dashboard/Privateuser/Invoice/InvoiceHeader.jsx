import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import QRCode from "react-qr-code";

const InvoiceHeader = ({ invoiceId, _id, createdAt, pid }) => {
  const barcodeRef = useRef();

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-GB", {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  useEffect(() => {
    if (barcodeRef.current && pid) {
      JsBarcode(barcodeRef.current, pid, {
        format: "CODE128",
        displayValue: false,
        height: 30,
        width: 1.5,
        margin: 0,
        background: "transparent"
      });
    }
  }, [pid]);

  return (
    <div className="flex justify-between items-start mb-12 print:mb-2 border-b-2 border-blue-500 pb-6 print:pb-2">
      <div>
        <div className="flex items-center gap-3 mb-4">
           {/* Placeholder for Logo if needed, or just refined text */}
           <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl">J</div>
           <div>
              <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase leading-none print:text-xl">Jazeera</h1>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Diagnostic Center</span>
           </div>
        </div>
        
        <div className="text-xs text-gray-500 space-y-1 print:text-[10px] pl-1">
          <p className="font-medium text-gray-600">Ashuganj, Brahmanbaria, Chittagong, Bangladesh</p>
          <p>+880 1873 917 876</p>
          <p>smahmud1098@gmail.com</p>
        </div>
      </div>
      <div className="text-right">
        <h2 className="text-4xl font-black text-gray-100 mb-2 print:text-3xl">INVOICE</h2>
        <div className="text-sm space-y-1 print:space-y-0.5">
           <div className="flex justify-end gap-3 items-center">
             <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Invoice ID</span>
             <span className="font-mono font-bold text-lg text-gray-800">#{invoiceId || _id.slice(-6).toUpperCase()}</span>
           </div>
           <div className="flex justify-end gap-3 items-center">
             <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Date</span>
             <span className="font-medium text-gray-600">{formatDate(createdAt)}</span>
           </div>
           
           <div className="flex flex-col items-end mt-3 gap-2">
             <div className="p-1 bg-white border border-gray-100 rounded shadow-sm">
                 <QRCode 
                    value={`${window.location.origin}/patient-history/${pid}`} 
                    size={48}
                    level="L"
                 />
             </div>
             <div className="flex flex-col items-end">
                <svg ref={barcodeRef} className="h-8 w-auto opacity-70"></svg>
                <span className="text-[10px] font-mono text-gray-400 -mt-1">{pid}</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;
