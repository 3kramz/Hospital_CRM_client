import React, { forwardRef } from "react";
import JsBarcode from "jsbarcode";
import QRCode from "react-qr-code";

const InvoiceContent = forwardRef(({ invoiceData }, ref) => {
  const {
    patientInfo,
    tests,
    previousDue,
    totalDiscount,
    payment,
    grandTotal,
    pid,
    createdAt,
    _id,
  } = invoiceData;

  const testTotal = tests.reduce((sum, t) => sum + t.price, 0);
  const discountTotal =
    totalDiscount || tests.reduce((sum, t) => sum + (t.discount || 0), 0);
  const netTotal = testTotal - discountTotal + previousDue;
  const due = netTotal - payment;

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-GB", {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  // Barcode generation
  const barcodeRef = React.useRef();
  React.useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, pid, {
        format: "CODE128",
        displayValue: false, // Hidden value, shown nicely below if needed
        height: 30,
        width: 1.5,
        margin: 0,
        background: "transparent"
      });
    }
  }, [pid]);

  return (
    <div
      ref={ref}
      className="print-container w-full max-w-4xl mx-auto bg-white p-10 print:p-2 font-sans relative text-gray-800 print:text-sm"
    >
      {/* PAID / DUE Watermark */}
      <div
        className={`absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-black tracking-widest opacity-[0.08] select-none pointer-events-none rotate-[-45deg] border-8 rounded-xl px-10 py-4
          ${due <= 0 ? "text-green-600 border-green-600" : "text-red-500 border-red-500"}`}
      >
        {due <= 0 ? "PAID" : "DUE"}
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-12 print:mb-4 border-b border-gray-100 pb-8 print:pb-2">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 tracking-tight mb-2 print:text-2xl print:mb-1">Jazeera Diagnostic Center</h1>
          <div className="text-sm text-gray-500 space-y-1 print:text-xs">
            <p>Laxipur Mor, Rajshahi, 6000</p>
            <p>Phone: +880 1343 524 436</p>
            <p>Email: info@webnestsolution.com</p>
          </div>
          
           {/* QR Code */}
           <div className="mt-6 flex flex-col items-start gap-1">
              <div className="p-1 bg-white border border-gray-200 rounded">
                 <QRCode 
                    value={`${window.location.origin}/patient-history/${pid}`} 
                    size={64}
                    level="M"
                 />
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Scan for History</span>
           </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 print:text-xl print:mb-2">INVOICE</h2>
          <div className="text-sm space-y-2 print:space-y-1">
             <div className="flex justify-end gap-4">
               <span className="text-gray-500 font-medium">Invoice ID:</span>
               <span className="font-mono font-bold text-gray-700">#{_id.slice(-6).toUpperCase()}</span>
             </div>
             <div className="flex justify-end gap-4">
               <span className="text-gray-500 font-medium">Date:</span>
               <span className="font-medium text-gray-700">{formatDate(createdAt)}</span>
             </div>
             <div className="flex flex-col items-end mt-2">
               <svg ref={barcodeRef} className="opacity-80"></svg>
               <span className="text-xs font-mono text-gray-500 mt-1">{pid}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <div className="mb-8 print:mb-4">
         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 print:mb-2 print:pb-1">Bill To</h3>
         <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-sm print:gap-y-2 print:text-xs">
            <div className="flex flex-col">
               <span className="text-gray-500 text-xs mb-1">Patient Name</span>
               <span className="font-semibold text-gray-800 text-base">{patientInfo.name}</span>
            </div>
            <div className="flex flex-col">
               <span className="text-gray-500 text-xs mb-1">Patient ID</span>
               <span className="font-medium text-gray-700">{patientInfo.pid}</span>
            </div>
             <div className="flex flex-col">
               <span className="text-gray-500 text-xs mb-1">Phone</span>
               <span className="font-medium text-gray-700">{patientInfo.phone || "N/A"}</span>
            </div>
            <div className="flex flex-col">
               <span className="text-gray-500 text-xs mb-1">Age / Gender</span>
               <span className="font-medium text-gray-700">{patientInfo.age} / {patientInfo.gender}</span>
            </div>
            <div className="flex flex-col">
               <span className="text-gray-500 text-xs mb-1">Ref. Doctor</span>
               <span className="font-medium text-gray-700 truncate" title={patientInfo.refDoctor}>{patientInfo.refDoctor || "Self"}</span>
            </div> 
            <div className="flex flex-col">
               <span className="text-gray-500 text-xs mb-1">Date</span>
               <span className="font-medium text-gray-700">{formatDate(createdAt)}</span>
            </div>
         </div>
      </div>

      {/* Tests Table */}
      <div className="mb-8 print:mb-4">
        <table className="w-full text-sm print:text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 print:bg-gray-100">
              <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase text-xs tracking-wider rounded-tl-lg print:py-1 print:px-2">#</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase text-xs tracking-wider w-1/2 print:py-1 print:px-2">Test Name</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-600 uppercase text-xs tracking-wider print:py-1 print:px-2">Price</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-600 uppercase text-xs tracking-wider print:py-1 print:px-2">Disc.</th>
              <th className="py-3 px-4 text-right font-semibold text-gray-600 uppercase text-xs tracking-wider rounded-tr-lg print:py-1 print:px-2">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {tests.map((t, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-gray-400 font-mono text-xs print:py-1 print:px-2">{String(i + 1).padStart(2, '0')}</td>
                <td className="py-3 px-4 text-gray-800 font-medium print:py-1 print:px-2">{t.testName}</td>
                <td className="py-3 px-4 text-gray-600 text-right print:py-1 print:px-2">{t.price.toFixed(2)}</td>
                <td className="py-3 px-4 text-gray-500 text-right print:py-1 print:px-2">{t.discount > 0 ? `-${t.discount}` : '-'}</td>
                <td className="py-3 px-4 text-gray-800 font-medium text-right font-mono print:py-1 print:px-2">
                  {(t.price - (t.discount || 0)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tests.length === 0 && (
           <div className="p-4 text-center text-gray-400 italic bg-gray-50 print:p-2">No tests added.</div>
        )}
      </div>

      {/* Footer / Summary */}
      <div className="flex flex-col md:flex-row justify-between gap-8 mt-4 print:mt-2">
        <div className="md:w-1/2 pt-4 print:pt-0">
           {/* Terms or Notes */}
           <h4 className="font-semibold text-gray-700 text-sm mb-2">Terms & Conditions</h4>
           <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
             Payment is due upon receipt. Reports will be delivered after full payment.
             Please keep this invoice for your records.
           </p>
        </div>

        <div className="md:w-1/2">
           <div className="bg-gray-50 rounded-lg p-5 space-y-3 print:p-3 print:space-y-1 print:bg-transparent print:border print:border-gray-200">
              <div className="flex justify-between text-sm text-gray-600 print:text-xs">
                 <span>Subtotal</span>
                 <span className="font-medium text-gray-800">{testTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                 <span>Discount</span>
                 <span className="font-medium text-red-500">-{discountTotal.toFixed(2)}</span>
              </div>
              {previousDue > 0 && (
                 <div className="flex justify-between text-sm text-gray-600">
                   <span>Previous Due</span>
                   <span className="font-medium text-amber-600">{previousDue.toFixed(2)}</span>
                 </div>
              )}
              
              <div className="h-px bg-gray-200 my-2"></div>

              <div className="flex justify-between items-center">
                 <span className="font-bold text-gray-800">Grand Total</span>
                 <span className="font-bold text-xl text-blue-700">{grandTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 pt-1">
                 <span>Paid Amount</span>
                 <span className="font-medium text-green-600">-{payment}</span>
              </div>

               <div className="h-px bg-gray-200 my-2"></div>

              <div className="flex justify-between items-center pt-1">
                 <span className="font-bold text-gray-800 text-lg">Balance Due</span>
                 <span className={`font-bold text-xl ${due > 0 ? "text-red-600" : "text-green-600"}`}>
                   {Math.max(0, due).toFixed(2)}
                 </span>
              </div>
           </div>
        </div>
      </div>

      {/* Signature & Bottom Footer */}
      <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-end print:mt-8 print:pt-4">
         <div className="text-xs text-gray-400">
            <p>Authorized by: Hospital Administrator</p>
            <p className="mt-1">{new Date().toLocaleString()}</p>
         </div>
         <div className="text-center">
             <div className="w-40 border-t border-gray-300 mb-2"></div>
             <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Authorized Signature</p>
         </div>
      </div>
      
       <div className="mt-8 text-center print:mt-4">
          <p className="text-xs text-blue-300 font-medium">Thank you for choosing Jazeera Diagnostic Center</p>
       </div>
    </div>
  );
});

export default InvoiceContent;
